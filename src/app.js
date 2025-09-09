// Basic Feathers + Express skeleton
const { feathers } = require("@feathersjs/feathers");
const express = require("@feathersjs/express");
require("dotenv").config();

const { knexClient } = require("./db/knex");
const logger = require("./logger"); // <-- import logger
const services = require("./services");
const ingest = require("./ingest");

// Create a Feathers app with Express transport
const app = express(feathers());

// Attach Knex client to app (so services can use app.get('knex'))
app.set("knex", knexClient);

// Parse incoming JSON requests
app.use(express.json());

app.configure(express.rest());

// Register all services
app.configure(services);

app.configure(ingest);

// Basic healthcheck route
app.get("/", (req, res) => {
  res.json({ message: "Feathers app is running" });
});

// Global error handler provided by Feathers
app.use(express.errorHandler());

// Log on startup
logger.info("Feathers app initialized");

// Export the app so it can be used by server.js
module.exports = app;
