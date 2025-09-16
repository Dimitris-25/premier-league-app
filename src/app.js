// src/app.js
const { feathers } = require("@feathersjs/feathers");
const express = require("@feathersjs/express");
require("dotenv").config();

const configuration = require("@feathersjs/configuration");
const { knexClient } = require("./db/knex");
const middleware = require("./middleware");
const setupSwagger = require("./docs/swagger"); // Curated OpenAPI
const services = require("./services");
const authentication = require("./authentication"); // Feathers auth service
const authRoutes = require("./routes/auth"); // Custom /api/v1/login/*
const logger = require("./logger");

const app = express(feathers());

// ---- App configuration (.env, default.json, etc.)
app.configure(configuration());

// ---- Body parsers MUST be before rest/services so POST JSON is parsed
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- Feathers REST transport
app.configure(express.rest());

// ---- DB handles (knex available to services/hooks)
app.set("knex", knexClient);
app.set("knexClient", knexClient);
app.set("mysqlClient", knexClient);

// ---- PRE middlewares (cors/helmet/rate-limit etc.). Do NOT put parsers here.
app.configure(middleware.pre);

// ---- Swagger (UI at /docs, JSON at /openapi.json) – after parsers
app.configure(setupSwagger);

// ---- Services (users before auth so strategies can resolve entities)
app.configure(services);

// ---- Authentication (depends on users service)
app.configure(authentication);

// ---- Custom login routes (issue JWT, test-token, etc.)
app.configure(authRoutes);

// ---- After successful authentication: update last_login and never leak hash
const setLastLogin = async (context) => {
  const { app, result } = context;
  const u = result?.user;
  if (u?.user_id) {
    const knex = app.get("knex");
    await knex("users")
      .where("user_id", u.user_id)
      .update({ last_login: knex.fn.now(), updated_at: knex.fn.now() });
  }
  if (context.result?.user) {
    delete context.result.user.password_hash;
  }
  return context;
};

// Register auth hook if service is present
if (app.service("authentication")) {
  app.service("authentication").hooks({
    after: { create: [setLastLogin] },
  });
}

// ---- Healthcheck
app.get("/", (_req, res) => res.json({ message: "Feathers app is running" }));

// ---- POST middlewares (404 + global error handler)
app.configure(middleware.post);

logger.info("Feathers app initialized");
module.exports = app;
