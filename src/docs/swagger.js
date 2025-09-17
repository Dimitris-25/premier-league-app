const swaggerUi = require("swagger-ui-express");
const securitySchemes = require("./security");

// env flag
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
  process.env.EXPOSE_MAINTENANCE === "true"
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
const oddsPaths = require("./paths/odds.path")(EXPOSE_WRITES);
const fixturesLineupsPaths = require("./paths/fixturesLineups.path")(
  EXPOSE_WRITES
);
const eventsPaths = require("./paths/events.paths")(EXPOSE_WRITES);
const countriesPaths = require("./paths/countries.paths")(EXPOSE_WRITES);
const coachesPaths = require("./paths/coaches.paths")(EXPOSE_WRITES);
const citiesPaths = require("./paths/cities.paths")(EXPOSE_WRITES);
const bookmakersPaths = require("./paths/bookmakers.path")(EXPOSE_WRITES);
const betsPaths = require("./paths/bets.paths")(EXPOSE_WRITES);
const leaguesPaths = require("./paths/leagues.paths")(EXPOSE_WRITES);

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
const playersProfilesSchemas = require("./schemas/playersProfiles.schemas");
const oddsSchemas = require("./schemas/odds.schemas");
const fixturesLineupsSchemas = require("./schemas/fixturesLineups.schemas");
const eventsSchemas = require("./schemas/events.schemas");
const countriesSchemas = require("./schemas/countries.schemas");
const coachesSchemas = require("./schemas/coaches.schemas");
const citiesSchemas = require("./schemas/cities.schemas");
const bookmakersSchemas = require("./schemas/bookmakers.schemas");
const betsSchemas = require("./schemas/bets.schemas");
const leaguesSchemas = require("./schemas/leaguesSchemas");

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
      { name: "odds", description: "Pre matchs odds" },
      { name: "fixturesLineups", description: "Lineups" },
      { name: "events", description: "show matches stats" },
      { name: "countries", description: "All the countries " },
      { name: "coaches", description: "All coaches of premier league" },
      { name: "cities", description: "All the cities of England" },
      { name: "bookmakers", description: "All the books of England" },
      { name: "bets", description: "All bets props" },
      { name: "leagues", description: "All leagues" },
    ],

    components: {
      securitySchemes,
    },
    docs: {
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
        ...playersProfilesSchemas,
        ...oddsSchemas,
        ...fixturesLineupsSchemas,
        ...eventsSchemas,
        ...countriesSchemas,
        ...coachesSchemas,
        ...citiesSchemas,
        ...bookmakersSchemas,
        ...betsSchemas,
        ...leaguesSchemas,
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
      ...playersProfilesPaths,
      ...oddsPaths,
      ...fixturesLineupsPaths,
      ...eventsPaths,
      ...countriesPaths,
      ...coachesPaths,
      ...citiesPaths,
      ...bookmakersPaths,
      ...betsPaths,
      ...leaguesPaths,
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
  // console.log("[DOCS] Schemas loaded:", Object.keys(openapi.docs.schemas));
  // console.log("[DOCS] Paths loaded:", Object.keys(openapi.paths));
};
