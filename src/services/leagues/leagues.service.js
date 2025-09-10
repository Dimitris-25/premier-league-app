// src/services/leagues/leagues.service.js
const { LeaguesService } = require("./leagues.class");
const hooks = require("./hooks");

module.exports = function (app) {
  const knex = app.get("knex");

  const options = {
    // Feathers Knex adapter expects `Model` to be the initialized knex instance
    Model: knex,
    // MySQL table name
    name: "leagues",
    // Primary key column
    id: "league_id",
    // multi: ['create', 'patch', 'remove'] // (optional, keep same style as countries)
  };

  // Initialize service
  const service = new LeaguesService(options);
  app.use("/leagues", service);

  // Register hooks
  const leaguesService = app.service("leagues");
  leaguesService.hooks(hooks);

  // 🔹 Run fetch automatically at startup
  (async () => {
    try {
      console.log("⚽ Fetching leagues from API-Football...");
      const result = await service.fetchFromApi();
      console.log("✅ Leagues sync complete:", result);
    } catch (err) {
      console.error("❌ Failed to fetch leagues:", err.message);
    }
  })();

  // 🔹 Add custom endpoint /leagues/refresh
  app.use("/leagues/refresh", {
    async find() {
      return service.fetchFromApi();
    },
  });
};
