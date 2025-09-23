// src/app.js
const { feathers } = require("@feathersjs/feathers");
const express = require("@feathersjs/express");
require("dotenv").config();

const configuration = require("@feathersjs/configuration");
const { knexClient } = require("./db/knex");
const middleware = require("./middleware");
const setupSwagger = require("./docs/swagger");
const services = require("./services");
const authentication = require("./authentication");
const authRoutes = require("./routes/auth");
const logger = require("./logger");

// 🔹 CORS
const cors = require("cors");

const app = express(feathers());

// ------------------------------------------------------------------
// Load configuration
// ------------------------------------------------------------------
app.configure(configuration());

// ------------------------------------------------------------------
// Host / Port / Protocol
// ------------------------------------------------------------------
const port = Number(process.env.PORT || app.get("port") || 3030);
app.set("port", port);
app.set("host", process.env.HOSTNAME || "localhost");
app.set("protocol", (process.env.PROTOCOL || "http").replace(":", ""));
logger.info(`App host set to ${app.get("host")} (port ${app.get("port")})`);

// ------------------------------------------------------------------
// Body parsers
// ------------------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------------------------------------------------------------
// CORS (must be BEFORE services/routes)
// ------------------------------------------------------------------
const ALLOWED_ORIGINS = [
  "http://localhost:3030", // Swagger UI
  "http://localhost:5173", // Vite (variant)
  "http://localhost:5174", // Vite (variant)
  "http://localhost:5175", // ✅ Vite (τρέχεις εδώ)
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
];

const corsOptions = {
  origin(origin, cb) {
    // επιτρέπει Postman/cURL (no origin)
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error(`Not allowed by CORS: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: false,
};

app.use(cors(corsOptions));
// preflight
app.options("*", cors(corsOptions));

// ------------------------------------------------------------------
// Feathers REST
// ------------------------------------------------------------------
app.configure(express.rest());

// ------------------------------------------------------------------
// DB handles
// ------------------------------------------------------------------
app.set("knex", knexClient);
app.set("knexClient", knexClient);
app.set("mysqlClient", knexClient);

// ------------------------------------------------------------------
// PRE middlewares (helmet, rate-limit, κλπ.)
// ------------------------------------------------------------------
app.configure(middleware.pre);

// ------------------------------------------------------------------
// Swagger
// ------------------------------------------------------------------
app.configure(setupSwagger);

// ------------------------------------------------------------------
// Services
// ------------------------------------------------------------------
app.configure(services);

// ------------------------------------------------------------------
// Authentication
// ------------------------------------------------------------------
app.configure(authentication);

// ------------------------------------------------------------------
// Custom login routes (/api/v1/login/*)
// ------------------------------------------------------------------
app.configure(authRoutes);

// ------------------------------------------------------------------
// Auth hooks (last_login + hide password)
// ------------------------------------------------------------------
const setLastLogin = async (context) => {
  const { app, result } = context;
  const u = result?.user;
  if (u?.user_id) {
    const knex = app.get("knex");
    await knex("users")
      .where("user_id", u.user_id)
      .update({ last_login: knex.fn.now(), updated_at: knex.fn.now() });
  }
  if (context.result?.user) delete context.result.user.password_hash;
  return context;
};
if (app.service("authentication")) {
  app.service("authentication").hooks({ after: { create: [setLastLogin] } });
}

// ------------------------------------------------------------------
// Healthcheck
// ------------------------------------------------------------------
app.get("/", (_req, res) => res.json({ message: "Feathers app is running" }));

// ------------------------------------------------------------------
// POST middlewares (404/error handler)
// ------------------------------------------------------------------
app.configure(middleware.post);

logger.info("Feathers app initialized");
module.exports = app;
