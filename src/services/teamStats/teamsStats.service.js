// Service registration for file-based team stats importer
// Route: /teams-stats-files  (kept separate to avoid clashing with any API-based /team-stats)

"use strict";

const path = require("path");
const hooks = require("./hooks");
const { TeamsStatsService } = require("./teamsStats.class");

module.exports = function (app) {
  const knex = app.get("knex");
  if (typeof knex !== "function") {
    throw new Error("[teams-stats-files] Missing knex instance");
  }

  // Inputs: either directory with per-team files OR a consolidated file
  const dir =
    app.get("teamsStatsDir") ||
    process.env.TS_FILES_DIR ||
    path.resolve(process.cwd(), "files", "teams", "stats", "2025");

  const consolidatedFile =
    app.get("teamsStatsFile") || process.env.TS_CONSOLIDATED || null; // e.g. files/teams/stats/teams_statistics_league39_season2025.json

  const options = {
    Model: knex,
    name: "team_stats",
    id: "stats_id",
    teamsTable: "teamsinfo",
    leaguesTable: "leagues",

    dir,
    file: consolidatedFile,

    // optional fallbacks if the JSONs miss params
    defaultLeague: Number(process.env.TS_LEAGUE) || 39,
    defaultSeason: Number(process.env.TS_SEASON) || 2025,
  };

  const service = new TeamsStatsService(options);
  app.use("/teams-stats-files", service);

  const s = app.service("teams-stats-files");
  s.hooks(hooks);

  // Auto-import on boot (non-blocking)
  (async () => {
    try {
      console.log("📥 Importing team stats from files...");
      const result = await service.fetchFromFile();
      console.log("✅ Teams stats (files) import complete:", result);
    } catch (err) {
      console.error("❌ Teams stats (files) import failed:", err.message);
    }
  })();

  // Manual refresh endpoint
  app.use("/teams-stats-files/refresh", {
    async find() {
      return service.fetchFromFile();
    },
  });
};
