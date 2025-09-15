// src/routes/auth.js
// Custom login/recovery routes under /api/v1/* (curated to match OpenAPI).
// Includes validation (Zod) and rate limiting. Uses Feathers JWT middleware
// only for the protected test-token endpoint.

const express = require("express");
const { authenticate } = require("@feathersjs/express"); // Feathers JWT guard

// NOTE: If your controller file is named `authController.js` adjust the path accordingly.
const {
  loginAccessToken,
  testToken,
  passwordRecovery,
  resetPassword,
  checkResetToken,
} = require("../controllers/auth.controller");

const {
  loginLimiter,
  recoveryLimiter,
  resetLimiter,
} = require("../middleware/rateLimit");

const {
  loginBody,
  resetBody,
  emailParam,
  tokenParam,
} = require("../middleware/validators/authValidator");

module.exports = (app) => {
  const router = express.Router();

  // Public endpoints (no JWT required)
  // Issue JWT using local strategy
  router.post(
    "/api/v1/login/access-token",
    loginLimiter, // rate limit login attempts
    loginBody, // validate { email, password }
    loginAccessToken
  );

  // Send password recovery email (generic response to avoid info leakage)
  router.post(
    "/api/v1/password-recovery/:email",
    recoveryLimiter, // rate limit recovery attempts
    emailParam, // validate :email
    passwordRecovery
  );

  // Reset password using token + newPassword
  router.post(
    "/api/v1/reset-password/",
    resetLimiter, // rate limit resets
    resetBody, // validate { token, newPassword }
    resetPassword
  );

  // Quick check if a reset token is still valid
  router.get(
    "/api/v1/reset-password/:token",
    resetLimiter, // mild protection
    tokenParam, // validate :token
    checkResetToken
  );

  //  Protected endpoint (requires Bearer JWT)
  router.post(
    "/api/v1/login/test-token",
    authenticate("jwt"), // verifies JWT and populates req.params.user
    testToken
  );

  app.use(router);
};
