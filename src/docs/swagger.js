const swaggerUi = require("swagger-ui-express");
const securitySchemes = require("./security");

// env flag ΜΟΝΟ μία φορά (έξω)
const EXPOSE_WRITES =
  (process.env.EXPOSE_WRITES || "false").toLowerCase() === "true";

// Paths
const usersPaths = require("./paths/users.path");
const loginPaths = require("./paths/login.path");
const venuesPaths = require("./paths/venues.path")(EXPOSE_WRITES);
const transfersPaths = require("./paths/transfers.path")(EXPOSE_WRITES);
const teamsStatsPaths = require("./paths/teamsStats.path")(EXPOSE_WRITES);
const teamsInfoPaths = require("./paths/teamsInfo.path")(
  process.env.EXPOSE_WRITES === "true",
  process.env.EXPOSE_MAINTENANCE === "true" // βάλε false (ή άστο unset)
);
const seasonsPaths = require("./paths/seasons.path")(EXPOSE_WRITES);
const playersTopStatsPaths = require("./paths/playersTopStats.path")(
  EXPOSE_WRITES
);
const playersSeasonsStatsPaths = require("./paths/playersSeasonsStats.path")(
  EXPOSE_WRITES
);
const playersProfilesPaths = require("./paths/playersProfiles.path")(
  EXPOSE_WRITES
);
// Schemas
const userSchemas = require("./schemas/users.schemas");
const authSchemas = require("./schemas/auth.schemas");
const venueSchemas = require("./schemas/venues.schemas");
const transfersSchemas = require("./schemas/transfers.schemas");
const teamsStatsSchemas = require("./schemas/teamsStats.schemas");
const teamsInfoSchemas = require("./schemas/teamsInfo.schemas");
const seasonsSchemas = require("./schemas/seasons.schemas");
const playersTopStatsSchemas = require("./schemas/playersTopStats.schemas");
const playersSeasonsStatsSchemas = require("./schemas/playersSeasonsStats.schemas");
const playersProfiles = require("./schemas/playersProfiles.schema");

module.exports = (app) => {
  const PORT = process.env.PORT || 3030;
  const SERVER_URL =
    process.env.SWAGGER_SERVER_URL || `http://localhost:${PORT}`;

  const openapi = {
    openapi: "3.0.3",
    info: { title: "Premier League API", version: "1.0.0" },
    servers: [{ url: SERVER_URL }],
    tags: [
      { name: "login", description: "Authenticate and receive JWT" },
      { name: "users", description: "User management" },
      { name: "venues", description: "Venues management" },
      { name: "transfers", description: "Transfers management" },
      {
        name: "teamsStats",
        description: "Team season statistics (files importer)",
      },
      { name: "teamsInfo", description: "Teams informations" },
      { name: "seasons", description: "Seasons Informations" },
      {
        name: "playersTopStats",
        description: "Detailed specific stats for players",
      },
      { name: "playersSeasonsStats", description: "Players season stats" },
      { name: "playersProfiles", description: "Players profiles" },
    ],
    components: {
      securitySchemes,
      schemas: {
        ...userSchemas,
        ...authSchemas,
        ...venueSchemas,
        ...transfersSchemas,
        ...teamsStatsSchemas,
        ...teamsInfoSchemas,
        ...seasonsSchemas,
        ...playersTopStatsSchemas,
        ...playersSeasonsStatsSchemas,
      },
    },
    security: [{ bearer: [] }],
    paths: {
      ...loginPaths,
      ...usersPaths,
      ...venuesPaths,
      ...transfersPaths,
      ...teamsStatsPaths,
      ...teamsInfoPaths,
      ...seasonsPaths,
      ...playersTopStatsPaths,
      ...playersSeasonsStatsPaths,
    },
  };

  app.get("/openapi.json", (_req, res) => res.json(openapi));
  app.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(openapi, {
      swaggerOptions: { defaultModelsExpandDepth: -1 },
    })
  );
};
