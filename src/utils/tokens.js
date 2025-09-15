// src/utils/tokens.js
// Helpers to generate and verify password reset tokens.

const crypto = require("crypto");

/** Generate a random token and its SHA-256 hash for storage. */
function generateResetToken(length = 32) {
  const token = crypto.randomBytes(length).toString("hex");
  const token_hash = crypto.createHash("sha256").update(token).digest("hex");
  return { token, token_hash };
}

/** Constant-time string compare to avoid timing attacks. */
function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ba.length !== bb.length) return false;
  return crypto.timingSafeEqual(ba, bb);
}

module.exports = { generateResetToken, safeEqual };
