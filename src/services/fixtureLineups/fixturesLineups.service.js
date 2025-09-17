// src/services/lineups/fixturesLineups.service.js
const hooks = require("./hooks");
const { FixturesLineupsService } = require("./fixturesLineups.class");

module.exports = function (app) {
  const knex = app.get("knex");
  const service = new FixturesLineupsService({
    Model: knex,
    name: "fixturesLineUps",
    id: "lineup_id",
  });

  // ✅ Μόνιμο route όπως το migration/DB naming
  app.use("/api/v1/fixtures-lineups", service);
  app.service("api/v1/fixtures-lineups").hooks(hooks);

  // Προαιρετικό auto-import στο startup
  (async () => {
    try {
      const r = await service.fetchFromApi();
      console.log("📋 [fixtures-lineups] Auto-fetch completed", r);
    } catch (e) {
      console.error("❌ [fixtures-lineups] Auto-fetch failed:", e.message);
    }
  })();

  // ✅ refresh endpoint (ίδιο pattern με odds)
  app.use("/api/v1/fixtures-lineups/refresh", {
    async find() {
      return service.fetchFromApi();
    },
  });

  console.log("[SERVICE] /api/v1/fixtures-lineups registered");
  console.log("[SERVICE] /api/v1/fixtures-lineups/refresh registered");
};
