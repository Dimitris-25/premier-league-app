// src/controllers/auth.controller.js
// Controllers for login & password recovery flows.
// Includes Google Login with ID Token (GIS).

const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

// Utils
const { generateResetToken } = require("../utils/tokens");
const { sendPasswordRecoveryEmail } = require("../utils/mailer");

// Google OAuth2 client
const googleClient = process.env.GOOGLE_CLIENT_ID
  ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
  : null;

/**
 * Remove sensitive fields before returning a user object.
 */
function sanitizeUser(user) {
  if (!user) return user;
  const clone = { ...user };
  delete clone.password;
  delete clone.password_hash;
  delete clone.salt;
  return clone;
}

/**
 * POST /api/v1/login/access-token
 * Authenticate with email + password using Feathers "local" strategy.
 */
async function loginAccessToken(req, res, next) {
  try {
    const app = req.app;
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        statusCode: 400,
        error: "Bad Request",
        message: "Email and password are required.",
      });
    }

    const result = await app.service("authentication").create({
      strategy: "local",
      email,
      password,
    });

    const { accessToken, user } = result || {};
    return res.status(200).json({
      accessToken,
      tokenType: "Bearer",
      user: sanitizeUser(user),
    });
  } catch (err) {
    if (err && (err.code === 401 || err.name === "NotAuthenticated")) {
      return res.status(401).json({
        statusCode: 401,
        error: "Unauthorized",
        message: "Invalid credentials.",
      });
    }
    return next(err);
  }
}

/**
 * POST /api/v1/login/test-token
 * Verify Bearer token (JWT). Router already uses authenticate('jwt').
 */
async function testToken(req, res) {
  const user = req.params?.user || req.feathers?.user || null;
  return res.status(200).json({ valid: true, user: sanitizeUser(user) });
}

/**
 * POST /api/v1/password-recovery/:email
 */
async function passwordRecovery(req, res, next) {
  try {
    const app = req.app;
    const knex = app.get("knex");
    const { email } = req.params || {};

    if (!email) {
      return res.status(400).json({
        statusCode: 400,
        error: "Bad Request",
        message: "Email is required.",
      });
    }

    const user = await knex("users").where({ email }).first();

    const generic = {
      message:
        "If an account with that email exists, a password recovery email has been sent.",
    };

    if (!user) return res.status(200).json(generic);

    const { token, token_hash } = generateResetToken(24);
    const now = new Date();
    const expires = new Date(now.getTime() + 30 * 60 * 1000);

    await knex("password_resets").insert({
      user_id: user.user_id,
      email,
      token_hash,
      issued_at: now,
      expires_at: expires,
      ip: req.ip,
      user_agent: req.headers["user-agent"] || null,
    });

    await sendPasswordRecoveryEmail({ to: email, token });

    return res.status(200).json(generic);
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/v1/login/google-id
 * Body: { idToken }
 * Verifies Google ID token, upserts user, returns Feathers JWT.
 */
/**
 * POST /api/v1/login/google-id
 * Body: { idToken }
 * Verifies Google ID token, upserts user, returns Feathers-style JWT response.
 */
/**
 * POST /api/v1/login/google-id
 * Body: { idToken }
 * Verify Google ID token, upsert user, return Feathers-style JWT.
 */
async function loginGoogleIdToken(req, res, next) {
  try {
    if (!googleClient) {
      return res
        .status(501)
        .json({ ok: false, error: "google_oauth_disabled" });
    }

    const app = req.app;
    const knex = app.get("knex");

    const { idToken } = req.body || {};
    if (!idToken) {
      return res.status(400).json({
        statusCode: 400,
        error: "Bad Request",
        message: "idToken is required.",
      });
    }

    // 1) Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.sub || !payload.email) {
      return res.status(401).json({
        statusCode: 401,
        error: "Unauthorized",
        message: "Invalid Google token.",
      });
    }

    const googleId = String(payload.sub);
    const email = String(payload.email).toLowerCase();
    const name = payload.name || null;
    const picture = payload.picture || null;

    let user = await knex("users").where({ google_id: googleId }).first();

    if (!user && email) {
      const byEmail = await knex("users").where({ email }).first();
      if (byEmail) {
        await knex("users")
          .where({ user_id: byEmail.user_id }) // PK: user_id
          .update({
            google_id: googleId,
            google_name: byEmail.google_name || name,
            google_picture: byEmail.google_picture || picture,
            provider: "google",
            provider_id: googleId,
            updated_at: knex.fn.now(),
          });
        user = await knex("users").where({ user_id: byEmail.user_id }).first();
      }
    }

    if (!user) {
      const inserted = await knex("users")
        .insert(
          {
            email,
            google_id: googleId,
            google_name: name,
            google_picture: picture,
            role: "user",
            is_active: 1, // TINYINT(1)
            provider: "google",
            provider_id: googleId,
            created_at: knex.fn.now(),
            updated_at: knex.fn.now(),
          },
          ["user_id"]
        )
        .catch(async (err) => {
          // Fallback για drivers χωρίς returning
          if (String(err).includes("returning")) {
            const ids = await knex("users").insert({
              email,
              google_id: googleId,
              google_name: name,
              google_picture: picture,
              role: "user",
              is_active: 1,
              provider: "google",
              provider_id: googleId,
              created_at: knex.fn.now(),
              updated_at: knex.fn.now(),
            });
            const uid = Array.isArray(ids) ? ids[0] : ids;
            return [{ user_id: uid }];
          }
          throw err;
        });

      const newId = Array.isArray(inserted)
        ? (inserted[0].user_id ?? inserted[0])
        : inserted.user_id;
      user = await knex("users").where({ user_id: newId }).first();
    }

    // 3) Έκδοση JWT (ίδιο format με το local login)
    const auth = app.get("authentication") || {};
    const secret = auth.secret || process.env.AUTH_SECRET;
    const expiresIn = process.env.AUTH_JWT_EXPIRES_IN || "7d";

    const raw = auth.jwtOptions || {};
    const signOpts = { expiresIn };

    // Μόνο αν είναι σωστού τύπου τα περνάμε στο jwt.sign
    if (typeof raw.audience === "string" || Array.isArray(raw.audience)) {
      signOpts.audience = raw.audience;
    }
    if (typeof raw.issuer === "string") {
      signOpts.issuer = raw.issuer;
    }

    const accessToken = jwt.sign(
      { sub: String(user.user_id), userId: user.user_id, email: user.email },
      secret,
      signOpts
    );

    // 4) last_login
    await knex("users")
      .where({ user_id: user.user_id })
      .update({ last_login: knex.fn.now(), updated_at: knex.fn.now() });

    return res.status(200).json({
      accessToken,
      tokenType: "Bearer",
      user: sanitizeUser(user),
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/v1/reset-password/:token
 */
async function checkResetToken(req, res, next) {
  try {
    const app = req.app;
    const knex = app.get("knex");
    const { token } = req.params || {};

    if (!token) {
      return res.status(400).json({
        statusCode: 400,
        error: "Bad Request",
        message: "Token is required.",
      });
    }

    const token_hash = crypto.createHash("sha256").update(token).digest("hex");
    const row = await knex("password_resets").where({ token_hash }).first();

    if (!row || row.used_at || new Date(row.expires_at) < new Date()) {
      return res.status(410).json({
        statusCode: 410,
        error: "Gone",
        message: "Token expired or already used.",
      });
    }

    return res.status(200).json({ valid: true });
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/v1/reset-password
 */
async function resetPassword(req, res, next) {
  try {
    const app = req.app;
    const knex = app.get("knex");
    const { token, newPassword } = req.body || {};

    if (!token || !newPassword) {
      return res.status(400).json({
        statusCode: 400,
        error: "Bad Request",
        message: "Token and newPassword are required.",
      });
    }

    const token_hash = crypto.createHash("sha256").update(token).digest("hex");
    const row = await knex("password_resets").where({ token_hash }).first();

    if (!row || row.used_at || new Date(row.expires_at) < new Date()) {
      return res.status(410).json({
        statusCode: 410,
        error: "Gone",
        message: "Token expired or already used.",
      });
    }

    const saltRounds = Number(process.env.BCRYPT_ROUNDS || 10);
    const password_hash = await bcrypt.hash(String(newPassword), saltRounds);

    await knex("users")
      .where({ user_id: row.user_id })
      .update({ password_hash, updated_at: knex.fn.now() });

    await knex("password_resets")
      .where({ reset_id: row.reset_id })
      .update({ used_at: knex.fn.now() });

    return res.status(200).json({ message: "Password updated successfully." });
  } catch (err) {
    return next(err);
  }
}
async function loginGoogle(req, res) {
  const hasGoogle =
    !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

  if (!hasGoogle) {
    return res.status(501).json({ ok: false, error: "google_oauth_disabled" });
  }

  // Αν έχεις app.configure(oauth()) και route /oauth/google,
  // τότε το redirect αυτό ξεκινάει το flow.
  return res.redirect("/oauth/google");
}

module.exports = {
  loginAccessToken,
  testToken,
  passwordRecovery,
  checkResetToken,
  resetPassword,
  loginGoogleIdToken, // GIS
  loginGoogle, // <- ΠΡΟΣΘΗΚΗ: το redirect flow που καλεί το route /login/google
};
