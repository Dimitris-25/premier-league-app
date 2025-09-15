// src/middleware/index.js
// Common Express middlewares for Feathers v5 app

const express = require("express");
const cors = require("cors");
const { errorHandler } = require("@feathersjs/express");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const crypto = require("crypto");

// helpers
function parseOrigins(str) {
  return String(str || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function requestId() {
  return (req, res, next) => {
    const id =
      req.headers["x-request-id"] ||
      (crypto.randomUUID
        ? crypto.randomUUID()
        : crypto.randomBytes(16).toString("hex"));
    req.id = id;
    res.setHeader("X-Request-Id", id);
    next();
  };
}

function buildCorsOptions() {
  const allow = parseOrigins(process.env.ALLOWED_ORIGINS);
  if (!allow.length) {
    // Dev-friendly: reflect request origin
    return {
      origin: true,
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
      exposedHeaders: ["X-Request-Id"],
    };
  }
  return {
    origin(origin, cb) {
      if (!origin) return cb(null, true); // server-to-server
      cb(null, allow.includes(origin));
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
    exposedHeaders: ["X-Request-Id"],
  };
}

// Rate limiters (env overridable)
const generalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_WINDOW_MS || 5 * 60 * 1000),
  max: Number(process.env.RATE_MAX || 300),
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: Number(process.env.AUTH_RATE_WINDOW_MS || 5 * 60 * 1000),
  max: Number(process.env.AUTH_RATE_MAX || 20),
  standardHeaders: true,
  legacyHeaders: false,
});

//  exports
// Call *before* services
function pre(app) {
  // Behind reverse proxy (e.g., Nginx) set TRUST_PROXY=1
  if (process.env.TRUST_PROXY) {
    app.set(
      "trust proxy",
      process.env.TRUST_PROXY === "true" ? 1 : Number(process.env.TRUST_PROXY)
    );
  }

  app.use(requestId());
  app.use(cors(buildCorsOptions()));
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }, // allow static/docs if needed
    })
  );
  app.use(compression());
  app.use(express.json({ limit: process.env.JSON_LIMIT || "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(process.env.MORGAN_FORMAT || "dev"));

  // Apply rate limits
  app.use(generalLimiter);
  app.use("/authentication", authLimiter);
}

// Call *after* services
function post(app) {
  // 404 (REST)
  app.use((req, res) => {
    res
      .status(404)
      .json({ error: "Not Found", path: req.originalUrl, requestId: req.id });
  });

  // Feathers/Express error formatter (keeps JSON error shape)
  app.use(errorHandler());
}

module.exports = { pre, post };
