// src/authentication.js
// Feathers authentication (JWT + Local with password_hash + optional Google OAuth)

const {
  AuthenticationService,
  JWTStrategy,
} = require("@feathersjs/authentication");
const { LocalStrategy } = require("@feathersjs/authentication-local");
const { OAuthStrategy, oauth } = require("@feathersjs/authentication-oauth");
const { NotAuthenticated } = require("@feathersjs/errors");
const bcrypt = require("bcryptjs");

// Optional Google OAuth strategy (registered only if keys exist)
class GoogleStrategy extends OAuthStrategy {}

// Local strategy that:
// 1) βρίσκει entity απευθείας από Knex (όχι service.find)
// 2) συγκρίνει με `password_hash`
class PasswordHashLocalStrategy extends LocalStrategy {
  get configuration() {
    const base = super.configuration || {};
    return {
      ...base,
      usernameField: base.usernameField || "email",
      passwordField: base.passwordField || "password",
    };
  }

  // Read user directly from DB to avoid relying on service.find
  async findEntity(username, params) {
    const { usernameField = "email" } = this.configuration;
    const knex = this.app.get("knex");
    const value =
      usernameField === "email"
        ? String(username).trim().toLowerCase()
        : String(username);

    const row = await knex("users").where(usernameField, value).first();
    if (!row) throw new NotAuthenticated("Invalid login."); // same behavior as core
    return row;
  }

  // Compare plain password to stored bcrypt hash
  async comparePassword(entity, password) {
    const hash = entity?.password_hash ?? entity?.password;
    if (!hash) throw new NotAuthenticated("User has no password hash.");
    const ok = await bcrypt.compare(String(password), String(hash));
    if (!ok) throw new NotAuthenticated("Invalid login.");
    return entity;
  }
}

module.exports = (app) => {
  const existing = app.get("authentication") || {};

  const hasGoogleKeys = !!(
    (existing.oauth &&
      existing.oauth.google &&
      existing.oauth.google.key &&
      existing.oauth.google.secret) ||
    (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  );

  const baseStrategies = Array.isArray(existing.authStrategies)
    ? existing.authStrategies.filter((s) => s !== "google")
    : ["jwt", "local"];
  const authStrategies = hasGoogleKeys
    ? Array.from(new Set([...baseStrategies, "google"]))
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
    oauth: existing.oauth,
  };

  app.set("authentication", merged);

  // Register service FIRST
  const authentication = new AuthenticationService(app);
  authentication.register("jwt", new JWTStrategy());
  authentication.register("local", new PasswordHashLocalStrategy());
  app.use("authentication", authentication);

  // Enable OAuth only if keys exist
  if (hasGoogleKeys) {
    authentication.register("google", new GoogleStrategy());
    app.configure(oauth());
  }
};
