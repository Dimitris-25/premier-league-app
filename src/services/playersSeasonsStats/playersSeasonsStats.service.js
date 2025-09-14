const { PlayersSeasonStatsService } = require("./playersSeasonStats.class");
const hooks = require("./hooks");

module.exports = function (app) {
  const knex = app.get("knex");

  const options = {
    Model: knex,
    name: "playersseasonstats", // ⬅ lowercase table name
    id: "pss_id",

    // ensure FK lookups hit your real tables (all lowercase)
    playersTable: "playersprofiles",
    teamsTable: "teamsinfo",
    leaguesTable: "leagues",
  };

  const service = new PlayersSeasonStatsService(options);
  app.use("/players-season-stats", service);

  const pssService = app.service("players-season-stats");
  pssService.hooks(hooks);

  (async () => {
    try {
      console.log("⚽ Fetching players season stats from API-Football...");
      const result = await service.fetchFromApi();
      console.log("✅ Players season stats sync complete:", result);
    } catch (err) {
      console.error("❌ Failed to fetch players season stats:", err.message);
    }
  })();
};
