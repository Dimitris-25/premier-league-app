// src/services/coaches/coaches.service.js
// - Registers the service at /coaches
// - Hooks registration
// - Auto-import at startup from files/teams/coaches_2025.json
// - Custom endpoint /coaches/import?file=<relativePath>

const path = require("path");
const { CoachesService } = require("./coaches.class");
const hooks = require("./hooks");

module.exports = function (app) {
  const knex = app.get("knex");

  const options = {
    Model: knex,
    name: "coaches",
    id: "coach_id",
  };

  // Initialize service
  const service = new CoachesService(options);
  app.use("/coaches", service);

  // Register hooks
  const coachesService = app.service("coaches");
  coachesService.hooks(hooks);

  // Auto-import on startup (reads local JSON)
  (async () => {
    try {
      console.log("👔 Importing coaches from local file...");
      const result = await service.importFromFile(
        path.join("files", "teams", "coaches_2025.json")
      );
      console.log("✅ Coaches import:", result);
    } catch (err) {
      console.error("❌ Coaches import failed:", err.message);
    }
  })();

  // Custom endpoint to re-import on demand
  app.use("/coaches/import", {
    async find(params) {
      const rel =
        params?.query?.file || path.join("files", "teams", "coaches_2025.json");
      return service.importFromFile(rel);
    },
  });
};
