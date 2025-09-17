// src/services/odds/odds.service.js
const { OddsService } = require("./odds.class");
const hooks = require("./hooks");

module.exports = function (app) {
  const knex = app.get("knex");

  const options = {
    Model: knex,
    name: "odds",
    id: "odd_id",
    fixturesTable: "fixtures",
    leaguesTable: "leagues",
    bookmakersTable: "bookmakers",
  };

  const service = new OddsService(options);

  // Service mount
  app.use("/api/v1/odds", service);

  // Prefer Feathers-style lookup (χωρίς leading slash)
  const oddsService = app.service("api/v1/odds");
  oddsService.hooks(hooks);

  // Optional auto-sync on startup (guarded by env)
  if ((process.env.AUTO_SYNC_ODDS || "true").toLowerCase() === "true") {
    (async () => {
      try {
        console.log("🎲 Fetching odds from API-Football...");
        const result = await service.fetchFromApi();
        console.log("✅ Odds sync complete:", result);
      } catch (err) {
        console.error("❌ Failed to fetch odds:", err.message);
      }
    })();
  }

  // Manual refresh endpoint (read-only)
  app.use("/api/v1/odds/refresh", {
    async find() {
      return service.fetchFromApi();
    },
  });

  console.log("[SERVICE] /api/v1/odds registered");
  console.log("[SERVICE] /api/v1/odds/refresh registered");
};
