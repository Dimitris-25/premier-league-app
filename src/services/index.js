// src/services/index.j// Register all services here
const countries = require("./countries/countries.service");
const leagues = require("./leagues/leagues.service");
const seasons = require("./seasons/seasons.service");
const venues = require("./venues/venues.service");
const cities = require("./cities/cities.service");
const teamsInfo = require("./teamsInfo/teamsInfo.service");

module.exports = function (app) {
  // Register countries service
  app.configure(countries);
  app.configure(leagues);
  app.configure(seasons);
  app.configure(venues);
  app.configure(cities);
  app.configure(teamsInfo);
};
