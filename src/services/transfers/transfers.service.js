// src/services/transfers/transfers.service.js
const { Transfers } = require("./transfers.class");
const hooks = require("./hooks");

module.exports = function (app) {
  const knex = app.get("knex");

  const options = {
    Model: knex,
    name: "transfers",
    playersTable: "playersProfiles",
    teamsTable: "teamsInfo",
  };

  const service = new Transfers(options);
  app.use("/transfers", service);

  const transfersService = app.service("transfers");
  transfersService.hooks(hooks);

  (async () => {
    try {
      console.log("🔁 Importing transfers from local file...");
      const result = await service.fetchFromApi();
      console.log("✅ Transfers import:", result);
    } catch (err) {
      console.error("❌ Transfers import failed:", err.message);
    }
  })();

  app.use("/transfers/refresh", {
    async find() {
      return service.fetchFromApi();
    },
  });
};
