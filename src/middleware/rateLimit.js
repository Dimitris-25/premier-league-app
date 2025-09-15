// src/middleware/rateLimit.js
// Express rate limiters for auth endpoints.

const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: 429,
    error: "Too Many Requests",
    message: "Too many login attempts, please try again later.",
  },
});

const recoveryLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: 429,
    error: "Too Many Requests",
    message: "Too many recovery attempts, please try again later.",
  },
});

const resetLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: 429,
    error: "Too Many Requests",
    message: "Too many requests, please try again later.",
  },
});

module.exports = { loginLimiter, recoveryLimiter, resetLimiter };
