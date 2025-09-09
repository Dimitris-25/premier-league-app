const { CountriesService } = require("./countries.class");

module.exports = function (app) {
  const knex = app.get("knex");

  const options = {
    // Feathers Knex adapter expects `Model` to be the initialized knex instance
    Model: knex,
    // MySQL table name
    name: "countries",
    // Primary key column
    id: "country_id",
    // Optional: allow multi create/patch/remove if you want later
    // multi: ['create', 'patch', 'remove']
  };

  app.use("/countries", new CountriesService(options));
};
