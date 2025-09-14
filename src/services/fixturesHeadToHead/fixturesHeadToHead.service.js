// src/services/fixturesHeadToHead/fixturesHeadToHead.service.js
// - Registers the service at /h2h
// - Auto-run import at startup (from files/teams/H2H.json)
// - Custom endpoint /h2h/import?file=<relativePath>

const path = require("path");
const { FixturesHeadToHeadService } = require("./fixturesHeadToHead.class");
const hooks = require("./hooks");

module.exports = function (app) {
  const knex = app.get("knex");

  // Feathers Knex options (table name matches your migration)
  const options = {
    Model: knex,
    name: "fixturesHeadToHead",
    id: "h2h_id",
  };

  // Initialize service
  const service = new FixturesHeadToHeadService(options);
  app.use("/h2h", service);

  // Register hooks
  const h2hService = app.service("h2h");
  h2hService.hooks(hooks);

  // 🔹 Auto-import from local file at startup (same idea as leagues auto-fetch)
  (async () => {
    try {
      console.log("⚽ Importing H2H from local file...");
      const result = await service.importFromFile(
        path.join("files", "teams", "H2H.json")
      );
      console.log("✅ H2H import complete:", result);
    } catch (err) {
      console.error("❌ Failed to import H2H:", err.message);
    }
  })();

  // 🔹 Custom endpoint: /h2h/import?file=files/teams/H2H.json
  app.use("/h2h/import", {
    async find(params) {
      const rel =
        params?.query?.file || path.join("files", "teams", "H2H.json");
      return service.importFromFile(rel);
    },
  });
};
