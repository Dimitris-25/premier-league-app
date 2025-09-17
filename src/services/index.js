module.exports = function (app) {
  // Helper to register services
  const reg = (name, fn) => {
    app.configure(fn);
  };

  const users = require("./user/users.service");
  const countries = require("./countries/countries.service");

  const seasons = require("./seasons/seasons.service");
  const venues = require("./venues/venues.service");
  const teamsInfo = require("./teamsInfo/teamsInfo.service");
  const transfers = require("./transfers/transfers.service");
  const teamStats = require("./teamStats/teamsStats.service");
  const playersTopStats = require("./playersTopStats/playersTopStats.service");
  const playersSeasonsStats = require("./playersSeasonsStats/playersSeasonsStats.service");
  const playersProfiles = require("./playersProfiles/playersProfiles.service");
  const odds = require("./odds/odds.service");
  const fixturesLineups = require("./fixtureLineups/fixturesLineups.service");
  const events = require("./events/events.service");
  const coaches = require("./coaches/coaches.service");
  const cities = require("./cities/cities.service");
  const bookmakers = require("./bookmakers/bookmakers.service");
  const bets = require("./bets/bets.service");
  const leagues = require("./leagues/leagues.service");

  reg("leagues", leagues);
  reg("bets", bets);
  reg("bookmakers", bookmakers);
  reg("cities", cities);
  reg("coaches", coaches);
  reg("events", events);
  reg("fixtureslineups", fixturesLineups);
  reg("odds", odds);
  reg("playersProfiles", playersProfiles);
  reg("playersSeasonsStats", playersSeasonsStats);
  reg("playersTopStats", playersTopStats);
  reg("transfers", transfers);
  reg("teamStats", teamStats);

  reg("users", users);
  reg("countries", countries);
  reg("seasons", seasons);
  reg("venues", venues);
  reg("teamsInfo", teamsInfo);
};
