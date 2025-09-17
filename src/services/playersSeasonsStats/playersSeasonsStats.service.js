// src/services/playersSeasonStats/playersSeasonStats.service.js
// - initialize with knex + options
// - auto-sync on boot from API
// - expose /players-season-stats/refresh to re-run the API import

const { PlayersSeasonStatsService } = require("./playersSeasonsStats.class");
const hooks = require("./hooks");

module.exports = function (app) {
  const knex = app.get("knex");
  if (typeof knex !== "function") {
    throw new Error("[players-season-stats] Missing knex instance");
  }

  // Build options (lowercase table names to match your DB)
  const options = {
    Model: knex,
    name: "playersseasonstats",
    id: "pss_id",

    // FK tables (ensure they match your DB)
    playersTable: "playersprofiles",
    teamsTable: "teamsinfo",
    leaguesTable: "leagues",
  };

  // Initialize service
  const service = new PlayersSeasonStatsService(options);
  app.use("/api/v1/players-season-stats", service);

  // Register hooks
  const pssService = app.service("/api/v1/players-season-stats");
  pssService.hooks(hooks);

  // Auto-import on boot (non-blocking)
  (async () => {
    try {
      console.log("⚽ Importing players season stats from API-Football...");
      const result = await service.fetchFromApi();
      console.log("✅ Players season stats import complete:", result);
    } catch (err) {
      console.error("❌ Players season stats import failed:", err.message);
    }
  })();

  // Manual refresh endpoint (GET in docs, implemented as find)
  app.use("/api/v1/players-season-stats/refresh", {
    async find() {
      return service.fetchFromApi();
    },
  });
};
