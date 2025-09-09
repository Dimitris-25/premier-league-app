// Register all ingest routes here

module.exports = function (app) {
  require("./countries.fetch")(app);
  // Later: require('./leagues.fetch')(app);
  // Later: require('./venues.fetch')(app);
};
