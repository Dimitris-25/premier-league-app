// src/routes/auth.js
// Curated login/recovery routes under /api/v1/* (hidden from Feathers services & docs).
// Includes validation (Zod) and rate limiting. JWT guard only for the protected test-token.

const express = require("express");
const { authenticate } = require("@feathersjs/express"); // Feathers JWT guard

const {
  loginAccessToken,
  testToken,
  passwordRecovery,
  checkResetToken,
  resetPassword,
  loginGoogleIdToken, // ✅ νέο (GIS flow)
  loginGoogle, // ✅ κρατάμε και το redirect flow αν υπάρχει στον controller
} = require("../controllers/auth.controller");

// Rate limiters
const {
  loginLimiter,
  recoveryLimiter,
  resetLimiter,
} = require("../middleware/rateLimit");

// Zod validators
const {
  loginBody,
  resetBody,
  emailParam,
  tokenParam,
} = require("../middleware/validators/authValidator");

module.exports = (app) => {
  const router = express.Router();

  // --- Google login ---
  // 1) Redirect flow (παλιό, αν το χρησιμοποιείς ακόμη)
  router.get("/api/v1/login/google", loginGoogle);

  // 2) GIS ID Token flow (React -> idToken)
  router.post("/api/v1/login/google-id", loginLimiter, loginGoogleIdToken);

  // --- Public endpoints (no JWT required) ---
  router.post(
    "/api/v1/login/access-token",
    loginLimiter,
    loginBody,
    loginAccessToken
  );

  router.post(
    "/api/v1/password-recovery/:email",
    recoveryLimiter,
    emailParam,
    passwordRecovery
  );

  router.post(
    "/api/v1/reset-password/",
    resetLimiter,
    resetBody,
    resetPassword
  );

  router.get(
    "/api/v1/reset-password/:token",
    resetLimiter,
    tokenParam,
    checkResetToken
  );

  // --- Protected (requires Bearer JWT) ---
  router.post("/api/v1/login/test-token", authenticate("jwt"), testToken);

  app.use(router);
};
