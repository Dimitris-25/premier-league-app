// src/services/teamsStats/teamsStats.service.js
const path = require("path");
const hooks = require("./hooks");
const { TeamsStatsService } = require("./teamsStats.class");

module.exports = function (app) {
  const knex = app.get("knex");
  const dir =
    app.get("teamsStatsDir") ||
    process.env.TS_FILES_DIR ||
    path.resolve(process.cwd(), "files", "teams", "stats", "2025");
  const consolidatedFile =
    app.get("teamsStatsFile") || process.env.TS_CONSOLIDATED || null;

  const options = {
    Model: knex,
    name: "team_stats",
    id: "stats_id",
    teamsTable: "teamsinfo",
    leaguesTable: "leagues",
    dir,
    file: consolidatedFile,
    defaultLeague: Number(process.env.TS_LEAGUE) || 39,
    defaultSeason: Number(process.env.TS_SEASON) || 2025,
  };

  const BASE = "/api/v1/teams-stats-files"; // ✅ ίδιο prefix με Swagger

  const service = new TeamsStatsService(options);
  app.use(BASE, service); // ✅ mount στο /api/v1/...

  const s = app.service(BASE); // ✅ hooks στο canonical path
  s.hooks(hooks);

  // (προαιρετικό) manual refresh
  app.use(`${BASE}/refresh`, {
    async find() {
      return service.fetchFromFile();
    },
  });
};
