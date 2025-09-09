// src/services/index.j// Register all services here
const countries = require("./countries/countries.service");

module.exports = function (app) {
  // Register countries service
  app.configure(countries);
};
