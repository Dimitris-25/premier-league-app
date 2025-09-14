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
    bookmakersTable: "bookmakers", // <-- pass mapping table
  };

  const service = new OddsService(options);
  app.use("/odds", service);

  const oddsService = app.service("odds");
  oddsService.hooks(hooks);

  (async () => {
    try {
      console.log("🎲 Fetching odds from API-Football...");
      const result = await service.fetchFromApi();
      console.log("✅ Odds sync complete:", result);
    } catch (err) {
      console.error("❌ Failed to fetch odds:", err.message);
    }
  })();

  app.use("/odds/refresh", {
    async find() {
      return service.fetchFromApi();
    },
  });
};
