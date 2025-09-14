// src/services/playersFixturesStats/playersFixturesStats.service.js
// Service registration + optional refresh + auto-import on boot.

const path = require("path");
const hooks = require("./hooks");
const { PlayersFixturesStatsService } = require("./playersFixturesStats.class");

module.exports = function (app) {
  // Resolve Knex client (same pattern as fixtures-stats)
  const knex =
    app.get("knex") || app.get("knexClient") || app.get("mysqlClient");
  if (typeof knex !== "function") {
    throw new Error("[players-fixtures-stats] Missing MySQL knex client");
  }

  // Resolve input file explicitly (no guessing)
  const statsFile =
    app.get("playersFixturesStatsFile") ||
    process.env.PLAYERS_FIXTURES_STATS_FILE ||
    path.resolve(process.cwd(), "files", "players", "playersStats2025.json");

  // Init service
  const service = new PlayersFixturesStatsService({
    name: "playersFixturesStats",
    id: "id",
    Model: knex,
    file: statsFile, // pass the file explicitly
  });

  // Mount at route (kebab-case like fixtures-stats)
  app.use("/players-fixtures-stats", service);
  app.service("/players-fixtures-stats").hooks(hooks);

  // Manual refresh endpoint
  app.get("/players-fixtures-stats/refresh", async (req, res, next) => {
    try {
      const result = await service.fetchFromFile();
      res.json({ ok: true, ...result });
    } catch (e) {
      next(e);
    }
  });

  // Auto-import on boot (non-blocking)
  (async () => {
    try {
      const r = await service.fetchFromFile();
      console.log("[players-fixtures-stats] Auto-import completed:", r);
    } catch (e) {
      console.log("[players-fixtures-stats] Auto-import failed:", e.message);
    }
  })();
};
