module.exports = function (app) {
  // Helper to register services
  const reg = (name, fn) => {
    app.configure(fn);
  };

  // -------------------------
  // Core services
  // -------------------------
  const users = require("./user/users.service");
  // const countries = require("./countries/countries.service");
  // const leagues = require("./leagues/leagues.service");
  const seasons = require("./seasons/seasons.service");
  const venues = require("./venues/venues.service");
  const teamsInfo = require("./teamsInfo/teamsInfo.service");
  const transfers = require("./transfers/transfers.service");
  const teamStats = require("./teamStats/teamsStats.service");
  const playersTopStats = require("./playersTopStats/playersTopStats.service");
  const playersSeasonsStats = require("./playersSeasonsStats/playersSeasonsStats.service");
  const playersProfiles = require("./playersProfiles/playersProfiles.service");

  reg("playersProfiles", playersProfiles);
  reg("playersSeasonsStats", playersSeasonsStats);
  reg("playersTopStats", playersTopStats);
  reg("transfers", transfers);
  reg("teamStats", teamStats);

  reg("users", users);
  // reg("countries", countries);
  // reg("leagues", leagues);
  reg("seasons", seasons);
  reg("venues", venues);
  reg("teamsInfo", teamsInfo);

  // -------------------------
  // Import services (τρέχουν ΜΟΝΟ αν IMPORT_ON_START=true)
  // -------------------------
  if (process.env.IMPORT_ON_START === "true") {
    // const fixtures = require("./fixtures/fixtures.service");
    // const fixturesHeadToHead = require("./fixturesHeadToHead/fixturesHeadToHead.service");
    // const fixturesStats = require("./fixtureStats/fixturesStats.service");
    // const lineups = require("./lineups/lineups.service");
    // const events = require("./events/events.service");
    // const transfers = require("./transfers/transfers.service");
    // const playersProfiles = require("./playersProfiles/playersProfiles.service");
    // const playersSeasonsStats = require("./playersSeasonsStats/playersSeasonsStats.service");
    // const playersTopStats = require("./playersTopStats/playersTopStats.service");
    // const odds = require("./odds/odds.service");
    // const predictions = require("./predictions/predictions.service");
    // const coaches = require("./coaches/coaches.service");
    // const injuries = require("./injuries/injuries.service");
    // const sidelined = require("./sidelined/sidelined.service");
    // const teamStats = require("./teamStats/teamStats.service");
    // const trophies = require("./trophies/trophies.service");
    // reg("fixtures", fixtures);
    // reg("fixturesHeadToHead", fixturesHeadToHead);
    // reg("fixturesStats", fixturesStats);
    // reg("lineups", lineups);
    // reg("events", events);
    // reg("transfers", transfers);
    // reg("playersProfiles", playersProfiles);
    // reg("playersSeasonsStats", playersSeasonsStats);
    // reg("playersTopStats", playersTopStats);
    // reg("odds", odds);
    // reg("predictions", predictions);
    // reg("coaches", coaches);
    // reg("injuries", injuries);
    // reg("sidelined", sidelined);
    // reg("teamStats", teamStats);
    // reg("trophies", trophies);
  }
};
