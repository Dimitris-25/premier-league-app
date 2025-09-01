const express = require('express');
const app = express()
const testRoutes = require("./routes/testRoutes");
const logger = require('./logger'); 
const teamRoutes = require("./routes/teams/teamRoutes");  
const venueRoutes = require("./routes/teams/venueRoutes.js");
const teamsStatsRoutes = require("./routes/teams/teamsStatsRoutes");
const teamFormRoutes = require("./routes/teams/teamFormRoutes");
const teamPlayersRoutes = require("./routes/teams/teamPlayersRoutes");
const playersRoutes = require("./routes/players/playersRoutes.js")
const leagueRoutes = require("./routes/leagues/leaguesRoutes");





app.use(express.json());

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  logger.debug("Root endpoint hit!");
  res.send('⚽ Premier League API is running...');
});

app.use("/api", testRoutes)
app.use("/api/teams", teamRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/teamsStats", teamsStatsRoutes)
app.use("/api/teamForm", teamFormRoutes);
app.use("/api/teamPlayers", teamPlayersRoutes);
app.use("/api/playersRoutes", playersRoutes)
app.use("/api/leagues", leagueRoutes);





module.exports = app;

