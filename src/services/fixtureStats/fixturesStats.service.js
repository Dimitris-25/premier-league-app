// src/services/fixtureStats/fixturesStats.service.js
// Service registration + optional refresh + auto-import on boot.

const path = require("path");
const hooks = require("./hooks");
const { FixturesStatsService } = require("./fixturesStats.class");

module.exports = function (app) {
  const knex =
    app.get("knex") || app.get("knexClient") || app.get("mysqlClient");
  if (typeof knex !== "function") {
    throw new Error("[fixtures-stats] Missing MySQL knex client");
  }

  // Resolve stats file explicitly (no guessing)
  const statsFile =
    app.get("fixturesStatsFile") ||
    process.env.FIXTURE_STATS_FILE ||
    path.resolve(process.cwd(), "files", "fixtures", "fixture_stats_2025.json");

  const service = new FixturesStatsService({
    name: "fixturesStats",
    id: "stat_id",
    Model: knex,
    file: statsFile, // <-- pass the file explicitly
  });

  app.use("/fixtures-stats", service);
  app.service("/fixtures-stats").hooks(hooks);

  // Manual refresh endpoint
  app.get("/fixtures-stats/refresh", async (req, res, next) => {
    try {
      const result = await service.fetchFromApi();
      res.json({ ok: true, ...result });
    } catch (e) {
      next(e);
    }
  });

  // Auto-import on boot (non-blocking)
  (async () => {
    try {
      const r = await service.fetchFromApi();
      console.log("[fixtures-stats] Auto-import completed:", r);
    } catch (e) {
      console.log("[fixtures-stats] Auto-import failed:", e.message);
    }
  })();
};
