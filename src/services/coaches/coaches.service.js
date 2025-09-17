// src/services/coaches/coaches.service.js
// - Registers the service at /api/v1/coaches
// - Hooks registration
// - Auto-import at startup from files/teams/coaches_2025.json
// - Custom endpoint /api/v1/coaches/refresh

const path = require("path");
const { CoachesService } = require("./coaches.class");
const hooks = require("./hooks");

module.exports = function (app) {
  const knex = app.get("knex");

  const options = {
    Model: knex,
    name: "coaches",
    id: "coach_id",
    multi: ["create", "patch", "remove"],
  };

  // Register Feathers CRUD service
  app.use("/api/v1/coaches", new CoachesService(options));

  // Register hooks
  const service = app.service("/api/v1/coaches");
  service.hooks(hooks);

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

  // Custom endpoint for refresh (import from file)
  app.get("/api/v1/coaches/refresh", async (req, res, next) => {
    try {
      const rel =
        req.query.file || path.join("files", "teams", "coaches_2025.json");
      const result = await service.importFromFile(rel);
      res.json(result);
    } catch (err) {
      next(err);
    }
  });
};
