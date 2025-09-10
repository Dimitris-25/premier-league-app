// src/services/countries/countries.service.js
const { CountriesService } = require("./countries.class");

module.exports = function (app) {
  const knex = app.get("knex");

  const options = {
    Model: knex,
    name: "countries",
    id: "country_id",
    multi: ["create", "patch", "remove"],
  };

  // Register Feathers CRUD service
  app.use("/countries", new CountriesService(options));

  // Custom endpoint for refresh
  app.get("/countries/refresh", async (req, res, next) => {
    try {
      const result = await app.service("countries").fetchFromApi();
      res.json(result);
    } catch (err) {
      next(err);
    }
  });
};
