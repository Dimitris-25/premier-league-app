const { SeasonsService } = require("./seasons.class");

module.exports = function (app) {
  const knex = app.get("knex");

  const options = {
    // Feathers Knex adapter expects `Model` to be the initialized knex instance
    Model: knex,
    // MySQL table name
    name: "seasons",
    // Primary key column
    id: "seasons_id",
    // multi: ['create', 'patch', 'remove'] // (optional, keep same style as countries)
  };
  app.use("/leagues/seasons", new SeasonsService(options));
};
