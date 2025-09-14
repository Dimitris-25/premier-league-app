// src/services/index.js
module.exports = function (app) {
  const only = process.env.SERVICE_ONLY; // π.χ. "countries", "leagues", "playersProfiles", ...

  const reg = (name, fn) => {
    if (!only || only === name) app.configure(fn);
  };

  // const countries      = require("./countries/countries.service");
  // const leagues        = require("./leagues/leagues.service");
  // const seasons        = require("./seasons/seasons.service");
  // const venues         = require("./venues/venues.service");
  // const cities         = require("./cities/cities.service");
  // const teamsInfo      = require("./teamsInfo/teamsInfo.service");
  // const bookmakers     = require("./bookmakers/bookmakers.service");
  // const bets           = require("./bets/bets.service");

  // const playersProfiles = require("./playersProfiles/playersProfiles.service");
  // const fixtures = require("./fixtures/fixtures.service");
  // const fixturesHeadToHead = require("./fixturesHeadToHead/fixturesHeadToHead.service");
  // const coaches = require("./coaches/coaches.service");
  // const fixturesLineups = require("./lineups/fixturesLineups.service");
  // const fixturesStats = require("./fixtureStats/fixturesStats.service");
  // const events = require("./events/events.service");
  // const odds = require("./odds/odds.service");
  // const playersFixturesStats = require("./playersFixturesStats/playersFixturesStats.service");
  // const playersSeasonStats = require("./playersSeasonsStats/playersSeasonsStats.service");
  // const playersTopStats = require("./playersTopStats/playersTopStats.service");
  // const teamStats = require("./teamStats/teamsStats.service");
  // const injuries = require("./injuries/injuries.service");
  const transfers = require("./transfers/transfers.service");
  // reg("playersProfiles", playersProfiles);
  // reg("fixtures", fixtures);
  // reg("fixturesHeadToHead", fixturesHeadToHead);
  // reg("coaches", coaches);
  // reg("fixturesLineUps", fixturesLineups);
  // reg("fixtureStats", fixturesStats);
  // reg("events", events);
  // reg("odds", odds);
  // reg("playersFixturesStats", playersFixturesStats);
  // reg("playersSeasonsStats", playersSeasonStats);
  // reg("playersTopStats", playersTopStats);
  // reg("teamStats", teamStats);
  // reg("injuries", injuries);
  reg("transfers", transfers);
};
