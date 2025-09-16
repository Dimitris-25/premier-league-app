// src/services/teamsInfo/teamsInfo.service.js
const { TeamsInfoService } = require("./teamsInfo.class");
const hooks = require("./hooks");

module.exports = function (app) {
  const knex = app.get("knex");

  const options = {
    Model: knex, // Feathers Knex adapter expects knex instance
    name: "teamsInfo", // MySQL table name
    id: "team_id", // Primary key column
  };

  // Initialize service
  const service = new TeamsInfoService(options);
  app.use("/api/v1/teamsInfo", service);

  // Register hooks
  const teamsInfoService = app.service("api/v1/teamsInfo");
  teamsInfoService.hooks(hooks);

  // 🔹 Run both file (2015–2024) + API (2025) fetch automatically at startup
  (async () => {
    try {
      console.log("📂 Fetching teamsInfo 2015–2024 from file...");
      const fileResult = await service.fetchFromFileAll(); //
      console.log("✅ TeamsInfo file sync complete:", fileResult);
    } catch (err) {
      console.error("❌ Failed to fetch teamsInfo from file:", err.message);
    }

    try {
      console.log("⚽ Fetching teamsInfo 2025 from API-Football...");
      const apiResult = await service.fetchFromApi();
      console.log("✅ TeamsInfo API sync complete:", apiResult);
    } catch (err) {
      console.error("❌ Failed to fetch teamsInfo (2025):", err.message);
    }
  })();

  // 🔹 Custom endpoint: /teamsInfo/refresh/api (season 2025 only)
  app.use("/api/v1/teamsInfo/refresh/api", {
    async find() {
      return service.fetchFromApi();
    },
  });

  // 🔹 Custom endpoint: /teamsInfo/refresh/file (2015–2024)
  app.use("/api/v1/teamsInfo/refresh/file", {
    async find() {
      return service.fetchFromFileAll();
    },
  });
};
