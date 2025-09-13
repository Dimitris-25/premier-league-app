const { Bets } = require("./bets.class");
const hooks = require("./hooks");

module.exports = function (app) {
  const knex = app.get("knex");

  const options = {
    Model: knex,
    name: "bets",
    id: "bet_id",
  };

  // Initialize service
  const service = new Bets(options);
  app.use("/bets", service);

  // Register hooks
  const betsService = app.service("bets");
  betsService.hooks(hooks);

  // 🔹 Run fetch automatically at startup
  (async () => {
    try {
      console.log("🎲 Fetching bets & odds from API-Football...");
      const result = await service.fetchAllFromApi();
      console.log("✅ Bets sync complete:", result);
    } catch (err) {
      console.error("❌ Failed to fetch bets:", err.message);
    }
  })();

  // 🔹 Add custom endpoint /bets/refresh
  app.use("/bets/refresh", {
    async find() {
      return service.fetchAllFromApi();
    },
  });
};
