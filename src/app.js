// src/app.js
const { feathers } = require("@feathersjs/feathers");
const express = require("@feathersjs/express");
require("dotenv").config();

const configuration = require("@feathersjs/configuration");
const { knexClient } = require("./db/knex");
const middleware = require("./middleware");
const setupSwagger = require("./docs/swagger"); // <- Curated OpenAPI (no /authentication in docs)
const services = require("./services");
const authentication = require("./authentication"); // <- Feathers auth service (internal)
const authRoutes = require("./routes/auth"); // <- Your custom /login endpoints
const logger = require("./logger");

const app = express(feathers());

app.configure(configuration());

// Enable REST transport (JSON parsers are registered in middleware.pre)
app.configure(express.rest());

// DB handles (make knex available to services/hooks)
app.set("knex", knexClient);
app.set("knexClient", knexClient);
app.set("mysqlClient", knexClient);

// --- PRE middlewares (CORS / helmet / rate-limit / parsers) ---
app.configure(middleware.pre);

// --- Swagger (UI at /docs, JSON at /openapi.json).
// IMPORTANT: Do NOT configure any auto feathers-swagger elsewhere.
app.configure(setupSwagger);

// --- Services (users must exist before auth so strategies can resolve entities) ---
app.configure(services);

// --- Authentication (depends on /users) ---
app.configure(authentication);

// Mount custom login routes (e.g., /api/v1/login/access-token, etc.)
app.configure(authRoutes);

// After successful authentication, update last_login and never leak password hash
const setLastLogin = async (context) => {
  // When provider is external (REST), a successful auth returns { accessToken, user }
  const { app, result } = context;
  const u = result?.user;

  // Update last_login only if we have a valid user_id
  if (u?.user_id) {
    const knex = app.get("knex");
    await knex("users").where("user_id", u.user_id).update({
      last_login: knex.fn.now(),
      updated_at: knex.fn.now(),
    });
  }

  // Ensure password hash never leaves the server in the auth response
  if (context.result?.user) {
    delete context.result.user.password_hash;
  }

  return context;
};

// Register hook only if the authentication service is present
if (app.service("authentication")) {
  app.service("authentication").hooks({
    after: { create: [setLastLogin] },
  });
}

// Healthcheck
app.get("/", (_req, res) => res.json({ message: "Feathers app is running" }));

// --- POST middlewares (404 + global error handler) ---
app.configure(middleware.post);

logger.info("Feathers app initialized");
module.exports = app;
