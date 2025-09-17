const { SeasonsService } = require("./seasons.class");
const hooks = require("./hooks");

module.exports = function (app) {
  const knex = app.get("knex");

  const options = { Model: knex, name: "seasons", id: "season_id" };

  app.use("/api/v1/seasons", new SeasonsService(options), {
    methods: ["find", "get", "create", "patch", "remove", "fetchFromApi"],
  });

  const service = app.service("/api/v1/seasons");
  service.hooks(hooks);

  (async () => {
    try {
      console.log("🚀 Fetching seasons from API-Football...");
      const result = await service.fetchFromApi();
      console.log("✅ Seasons sync complete:", result);
    } catch (err) {
      console.error("❌ Failed to fetch seasons:", err.message);
    }
  })();
};
