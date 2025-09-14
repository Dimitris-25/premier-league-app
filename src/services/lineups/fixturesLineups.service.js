const hooks = require("./hooks");
const { FixturesLineupsService } = require("./fixturesLineups.class");

module.exports = function (app) {
  const knex = app.get("knex");

  if (typeof knex !== "function") {
    throw new Error('[fixtures-lineups] knex not found on app.get("knex")');
  }

  const service = new FixturesLineupsService({
    Model: knex,
    name: "fixturesLineUps",
  });

  app.use("/fixtures-lineups", service);
  app.service("fixtures-lineups").hooks(hooks);

  (async () => {
    try {
      const r = await service.fetchFromApi();
      console.log("[fixtures-lineups] Auto-fetch completed", r);
    } catch (e) {
      console.error("[fixtures-lineups] Auto-fetch failed:", e.message);
    }
  })();
};
