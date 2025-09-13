// src/services/index.js

// ➜ Χρησιμοποιούμε το ίδιο στυλ όπως πριν (SERVICE_ONLY + reg helper)
module.exports = function (app) {
  const only = process.env.SERVICE_ONLY; // π.χ. "countries", "leagues", "playersProfiles", ...

  const reg = (name, fn) => {
    if (!only || only === name) app.configure(fn);
  };

  // --- εδώ τα services (όπως παλιά) ---
  // const countries      = require("./countries/countries.service");
  // const leagues        = require("./leagues/leagues.service");
  // const seasons        = require("./seasons/seasons.service");
  // const venues         = require("./venues/venues.service");
  // const cities         = require("./cities/cities.service");
  // const teamsInfo      = require("./teamsInfo/teamsInfo.service");
  // const bookmakers     = require("./bookmakers/bookmakers.service");
  // const bets           = require("./bets/bets.service");

  // ΜΟΝΟ playersProfiles προς το παρόν (με σωστό path/casing)
  const playersProfiles = require("./playersProfiles/playersProfiles.service");

  // --- καταχώρηση (όπως παλιά με reg) ---
  reg("playersProfiles", playersProfiles);
};
