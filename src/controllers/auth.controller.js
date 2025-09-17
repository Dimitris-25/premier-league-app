// src/controllers/auth.controller.js
// Controllers for login & password recovery flows (production-ready).
// Uses Feathers auth service for JWT/local, Knex for DB operations,
// bcrypt for hashing, and a mailer util for recovery emails.

const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// Utils
const { generateResetToken } = require("../utils/tokens");
const { sendPasswordRecoveryEmail } = require("../utils/mailer");

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
 * Returns a signed JWT and the sanitized user.
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
 * Verify Bearer token (JWT). Router already uses authenticate('jwt'),
 * so reaching this handler means the token is valid.
 */
async function testToken(req, res) {
  // Feathers attaches the resolved user in params (compat fields covered)
  const user = req.params?.user || req.feathers?.user || null;
  return res.status(200).json({ valid: true, user: sanitizeUser(user) });
}

/**
 * POST /api/v1/password-recovery/:email
 * Generate a one-time reset token, store its hash, and send a recovery email.
 * Always respond generically to avoid account enumeration.
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

    // Try to locate user (do not reveal result in the response)
    const user = await knex("users").where({ email }).first();

    // Always respond generically
    const generic = {
      message:
        "If an account with that email exists, a password recovery email has been sent.",
    };

    if (!user) return res.status(200).json(generic);

    // Generate raw token and store only its SHA-256 hash
    const { token, token_hash } = generateResetToken(24);
    const now = new Date();
    const expires = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes

    await knex("password_resets").insert({
      user_id: user.user_id,
      email,
      token_hash,
      issued_at: now,
      expires_at: expires,
      ip: req.ip,
      user_agent: req.headers["user-agent"] || null,
    });

    // Send email with reset link (mailer falls back to console in DEV if SMTP not set)
    await sendPasswordRecoveryEmail({ to: email, token });

    return res.status(200).json(generic);
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

  // Start Feathers OAuth flow (handled by authentication.js -> app.configure(oauth()))
  return res.redirect("/oauth/google");
}

/**
 * GET /api/v1/reset-password/:token
 * Quick check whether a provided reset token is valid (exists, not used, not expired).
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
 * POST /api/v1/reset-password/
 * Accepts { token, newPassword } and resets the password if token is valid.
 * Hashes the new password and invalidates the token (single-use).
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

    console.log("Salt rounds:", saltRounds);
    console.log("Hash:", hash);

    // Update user's password
    await knex("users")
      .where({ user_id: row.user_id })
      .update({ password_hash, updated_at: knex.fn.now() });

    // Invalidate token (mark as used)
    await knex("password_resets")
      .where({ reset_id: row.reset_id })
      .update({ used_at: knex.fn.now() });

    return res.status(200).json({ message: "Password updated successfully." });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  loginAccessToken,
  testToken,
  passwordRecovery,
  checkResetToken,
  resetPassword,
  loginGoogle,
};
