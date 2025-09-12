// src/services/index.js
const countries = require("./countries/countries.service");
const leagues = require("./leagues/leagues.service");
const seasons = require("./seasons/seasons.service");
const venues = require("./venues/venues.service");
const cities = require("./cities/cities.service");
const teamsInfo = require("./teamsInfo/teamsInfo.service");

module.exports = function (app) {
  const only = process.env.SERVICE_ONLY; // e.g. "countries", "cities", ...

  const reg = (name, fn) => {
    if (!only || only === name) app.configure(fn);
  };

  reg("countries", countries);
  reg("leagues", leagues);
  reg("seasons", seasons);
  reg("venues", venues);
  reg("cities", cities);
  reg("teamsInfo", teamsInfo);
};
