// src/authentication.js
// Feathers authentication (JWT + Local with password_hash via Knex) + optional Google OAuth.

const {
  AuthenticationService,
  JWTStrategy,
} = require("@feathersjs/authentication");
const { LocalStrategy } = require("@feathersjs/authentication-local");
const { OAuthStrategy, oauth } = require("@feathersjs/authentication-oauth");
const { NotAuthenticated } = require("@feathersjs/errors");
const bcrypt = require("bcryptjs");

// ------------------------- Google OAuth Strategy -------------------------
class GoogleStrategy extends OAuthStrategy {
  async getProfile(authResult) {
    const { access_token } = authResult;
    const res = await axios.get(
      "https://openidconnect.googleapis.com/v1/userinfo",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );
    // We need to return an object with sub/email/name/picture
    return res.data;
  }

  async getEntityData(profile, existing, params) {
    const base = await super.getEntityData(profile, existing, params);
    const email = profile?.email ? String(profile.email).toLowerCase() : null;

    const allowed = (process.env.ALLOWED_ADMINS || "")
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const role =
      existing?.role || (email && allowed.includes(email) ? "admin" : "user");

    return {
      ...base,
      email,
      name: profile?.name || existing?.name || null,
      google_id: profile?.sub,
      avatar: profile?.picture || null,
      role,
    };
  }
}

//  Local Strategy (reads password_hash)
class PasswordHashLocalStrategy extends LocalStrategy {
  get configuration() {
    const base = super.configuration || {};
    return {
      ...base,
      usernameField: base.usernameField || "email",
      passwordField: base.passwordField || "password",
    };
  }

  async getEntityId() {
    return "user_id";
  }

  async findEntity(username) {
    const { usernameField = "email" } = this.configuration;
    const knex = this.app.get("knex");

    const value =
      usernameField === "email"
        ? String(username).trim().toLowerCase()
        : String(username);

    const row = await knex("users").where(usernameField, value).first();
    if (!row) throw new NotAuthenticated("Invalid login.");
    return row;
  }

  async comparePassword(entity, password) {
    const hash = entity?.password_hash ?? entity?.password;
    if (!hash) throw new NotAuthenticated("User has no password hash.");
    const ok = await bcrypt.compare(String(password), String(hash));
    if (!ok) throw new NotAuthenticated("Invalid login.");
    return entity;
  }
}

module.exports = (app) => {
  //  Host/Port/Protocol:
  const BASE_URL =
    process.env.APP_URL ||
    `http://localhost:${process.env.PORT || app.get("port") || 3030}`;

  try {
    const u = new URL(BASE_URL);
    app.set("host", u.hostname || "localhost");
    app.set("port", Number(process.env.PORT) || Number(u.port) || 3030);
    app.set("protocol", (u.protocol || "http:").replace(":", "")); // "http"
  } catch (_) {
    app.set("host", "localhost");
    app.set("port", Number(process.env.PORT) || 3030);
    app.set("protocol", "http");
  }

  const existing = app.get("authentication") || {};
  const hasGoogleKeys = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
  );

  const baseStrategies = Array.isArray(existing.authStrategies)
    ? existing.authStrategies.filter((s) => s !== "google")
    : ["jwt", "local"];
  const authStrategies = hasGoogleKeys
    ? [...new Set([...baseStrategies, "google"])]
    : baseStrategies;

  const merged = {
    ...existing,
    secret: existing.secret || process.env.JWT_SECRET,
    entity: existing.entity || "user",
    service: existing.service || "users",
    authStrategies,
    jwtOptions: existing.jwtOptions || {
      header: { typ: "access" },
      algorithm: "HS256",
    },
    local: {
      usernameField: existing?.local?.usernameField || "email",
      passwordField: existing?.local?.passwordField || "password",
    },
    oauth: {
      ...(existing.oauth || {}),
      redirect:
        process.env.OAUTH_REDIRECT ||
        (existing.oauth && existing.oauth.redirect) ||
        "/",
      ...(hasGoogleKeys
        ? {
            google: {
              key: process.env.GOOGLE_CLIENT_ID,
              secret: process.env.GOOGLE_CLIENT_SECRET,
              scope: ["openid", "email", "profile"],
              callback: "/oauth/google/callback",
            },
          }
        : {}),
    },
  };

  app.set("authentication", merged);

  // ---------------------- Register Feathers auth service ----------------------
  const authentication = new AuthenticationService(app);
  authentication.register("jwt", new JWTStrategy());
  authentication.register("local", new PasswordHashLocalStrategy());
  app.use("authentication", authentication);

  if (hasGoogleKeys) {
    authentication.register("google", new GoogleStrategy());
    app.configure(oauth()); // /oauth/google & /oauth/google/callback
  }

  // ----------------------------- Curated API ---------------------------------
  app.post("/api/v1/login", async (req, res, next) => {
    try {
      const { email, password } = req.body || {};
      const out = await app.service("authentication").create({
        strategy: "local",
        email,
        password,
      });
      if (out?.user) delete out.user.password_hash;
      res.json(out);
    } catch (e) {
      next(e);
    }
  });

  app.service("authentication").hooks({
    after: {
      create: [
        async (ctx) => {
          if (ctx.result?.user) delete ctx.result.user.password_hash;
          return ctx;
        },
      ],
    },
  });
};
