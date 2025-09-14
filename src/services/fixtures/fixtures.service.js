const { Fixtures } = require("./fixtures.class");
const hooks = require("./hooks");

module.exports = function (app) {
  const knex = app.get("knex");

  const options = {
    Model: knex,
    name: "fixtures", // MySQL table
    id: "fixture_id",
  };

  const service = new Fixtures(options);
  app.use("/fixtures", service);

  const fixturesService = app.service("fixtures");
  fixturesService.hooks(hooks);

  // Auto import inside startup
  (async () => {
    try {
      console.log(
        "🎯 Importing fixtures from files/fixtures/results_2025.json..."
      );
      const result = await service.fetchFromApi();
      console.log("✅ Fixtures import complete:", result);
    } catch (err) {
      console.error("❌ Failed to import fixtures:", err.message);
    }
  })();

  app.use("/fixtures/import", {
    async find() {
      return service.fetchFromApi();
    },
  });
};
