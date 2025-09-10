// Basic Feathers + Express skeleton
const { feathers } = require("@feathersjs/feathers");
const express = require("@feathersjs/express");
require("dotenv").config();

const { knexClient } = require("./db/knex");
const logger = require("./logger");
const services = require("./services");

const app = express(feathers());

// Attach Knex client
app.set("knex", knexClient);

// Parse JSON
app.use(express.json());

// REST transport
app.configure(express.rest());

// Register Feathers services
app.configure(services);

// Healthcheck
app.get("/", (req, res) => {
  res.json({ message: "Feathers app is running" });
});

// Global error handler
app.use(express.errorHandler());

logger.info("Feathers app initialized");

module.exports = app;
