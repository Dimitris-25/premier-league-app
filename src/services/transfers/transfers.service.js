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

  const BASE = "/api/v1/transfers"; // ✅ ίδιο prefix με Swagger

  const service = new Transfers(options);
  app.use(BASE, service); // ✅ mount στο /api/v1/...

  const transfersService = app.service(BASE); // ✅ hooks στο canonical path
  transfersService.hooks(hooks);

  // (προαιρετικό) manual refresh endpoint
  app.use(`${BASE}/refresh`, {
    async find() {
      return service.fetchFromApi();
    },
  });
};
