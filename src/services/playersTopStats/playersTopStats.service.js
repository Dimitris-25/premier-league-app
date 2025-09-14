// src/services/playersTopStats/playersTopStats.service.js
// - initialize with knex + options
// - auto-import on boot from file
// - expose /players-top-stats/refresh to re-run the import

const path = require("path");
const { PlayersTopStatsService } = require("./playersTopStats.class");
const hooks = require("./hooks");

module.exports = function (app) {
  const knex = app.get("knex");
  if (typeof knex !== "function") {
    throw new Error("[players-top-stats] Missing knex instance");
  }

  // Resolve input file (allow override via app config or env)
  const inputFile =
    app.get("playersTopStatsFile") ||
    process.env.PTS_FILE ||
    path.resolve(process.cwd(), "files", "players", "playersStats2025.json");

  // Build options (lowercase table names to match your DB)
  const options = {
    Model: knex,
    name: "playerstopstats",
    id: "topstat_id",

    // FK tables
    playersTable: "playersprofiles",
    teamsTable: "teamsinfo",
    leaguesTable: "leagues",
    seasonsTable: "seasons",

    // File + fallbacks when the JSON lacks {league, season}
    file: inputFile,
    defaultLeague: Number(process.env.PTS_LEAGUE) || 39, // API league id
    defaultSeason: Number(process.env.PTS_SEASON) || 2025, // season year
  };

  // Initialize service
  const service = new PlayersTopStatsService(options);
  app.use("/players-top-stats", service);

  // Register hooks
  const ptsService = app.service("/players-top-stats");
  ptsService.hooks(hooks);

  // Auto-import on boot (non-blocking)
  (async () => {
    try {
      console.log("🏆 Importing players top stats from file...");
      const result = await service.fetchFromFile();
      console.log("✅ Players top stats import complete:", result);
    } catch (err) {
      console.error("❌ Players top stats import failed:", err.message);
    }
  })();

  // Manual refresh endpoint
  app.use("/players-top-stats/refresh", {
    async find() {
      return service.fetchFromFile();
    },
  });
};
