// src/docs/swagger.js
// Curated OpenAPI setup: hide the Feathers /authentication service entirely.
// We do NOT use feathers-swagger auto-generation here, so only what we define
// below (login + users) will appear in Swagger UI.

const swaggerUi = require("swagger-ui-express");

// Security schemes (e.g., HTTP Bearer)
const securitySchemes = require("./security");

// Paths (only the ones we want visible)
const usersPaths = require("./paths/users.path");
const loginPaths = require("./paths/login.path");

// Schemas
const userSchemas = require("./schemas/users.schemas");
const authSchemas = require("./schemas/auth.schemas");

module.exports = (app) => {
  const PORT = process.env.PORT || 3030;
  const SERVER_URL =
    process.env.SWAGGER_SERVER_URL || `http://localhost:${PORT}`;

  // Build the curated OpenAPI document
  // NOTE: Only "login" and "users" tags are exposed.
  const openapi = {
    openapi: "3.0.3",
    info: {
      title: "Premier League API",
      version: "1.0.0",
    },
    servers: [{ url: SERVER_URL }],
    tags: [
      { name: "login", description: "Authenticate and receive JWT" },
      { name: "users", description: "User management" },
    ],
    components: {
      securitySchemes,
      schemas: { ...userSchemas, ...authSchemas },
    },
    // Global Bearer security; individual login paths can override with `security: []`
    security: [{ bearer: [] }],
    paths: {
      ...loginPaths,
      ...usersPaths,
      // IMPORTANT: No '/authentication' paths here.
    },
  };

  // Serve the JSON spec
  app.get("/openapi.json", (_req, res) => res.json(openapi));

  // Serve Swagger UI using ONLY our curated spec
  app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(openapi, {
      swaggerOptions: {
        // Hide the "Schemas" side panel for a cleaner UI
        defaultModelsExpandDepth: -1,
      },
    })
  );

  // IMPORTANT:
  // - Do not configure `feathers-swagger` elsewhere in the app.
  // - Keep the Feathers authentication service active internally for JWT,
  //   but do not expose it via docs; since we don't auto-generate, it stays hidden.
};
