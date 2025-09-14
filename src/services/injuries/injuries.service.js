// src/services/injuries/injuries.service.js
const { InjuriesService } = require("./injuries.class");
const hooks = require("./hooks");

module.exports = function (app) {
  // same getter with odds.service.js
  const knex = app.get("knex");

  const options = {
    Model: knex,
    name: "injuries",
    id: "injury_id",
    // FK lookup tables (match your DB naming)
    playersTable: "playersprofiles",
    teamsTable: "teamsinfo",
    leaguesTable: "leagues",
    fixturesTable: "fixtures",
  };

  const service = new InjuriesService(options);
  app.use("/injuries", service);

  const injuriesService = app.service("injuries");
  injuriesService.hooks(hooks);

  // Auto-run fetch on startup (same style as odds)
  (async () => {
    try {
      console.log("🩹 Fetching injuries from API-Football...");
      const result = await service.fetchFromApi(); // defaults league=39, season=2025 inside class
      console.log("✅ Injuries sync complete:", result);
    } catch (err) {
      console.error("❌ Failed to fetch injuries:", err.message);
    }
  })();

  // Refresh endpoint (accepts optional ?league=&season=)
  app.use("/injuries/refresh", {
    async find(params) {
      const { league, season } = (params && params.query) || {};
      return service.fetchFromApi({ league, season });
    },
  });
};
