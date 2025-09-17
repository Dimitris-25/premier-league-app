// src/services/countries/countries.service.js
const { CountriesService } = require("./countries.class");
const hooks = require("./hooks");

module.exports = function (app) {
  const knex = app.get("knex");

  const options = {
    Model: knex,
    name: "countries",
    id: "country_id",
    multi: ["create", "patch", "remove"],
  };

  // Register Feathers CRUD service
  app.use("/api/v1/countries", new CountriesService(options));

  // Register hooks
  const service = app.service("/api/v1/countries");
  service.hooks(hooks);

  // Custom endpoint for refresh
  app.get("/api/v1/countries/refresh", async (req, res, next) => {
    try {
      const result = await service.fetchFromApi();
      res.json(result);
    } catch (err) {
      next(err);
    }
  });
};
