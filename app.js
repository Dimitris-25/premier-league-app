const express = require('express');
const app = express()
const testRoutes = require("./routes/testRoutes");
const logger = require('./logger'); 
const routes = require("./routes");
// const teamRoutes = require("./routes/teams/teamRoutes");  
// const venueRoutes = require("./routes/teams/venueRoutes.js");
// const teamsStatsRoutes = require("./routes/teams/teamsStatsRoutes");
// const teamFormRoutes = require("./routes/teams/teamFormRoutes");
// const teamPlayersRoutes = require("./routes/teams/teamPlayersRoutes");
// const playersRoutes = require("./routes/players/playersRoutes.js")
// const leagueRoutes = require("./routes/leagues/leaguesRoutes");
// const playersProfilesRoutes = require("./routes/players/playersProfilesRoutes");
// const playersSquadsRoutes = require("./routes/players/playersSquadsRoutes");
// const playersTeamsRoutes = require("./routes/players/playersTeamsRoutes");
// const leagueTopScorersRoutes = require("./routes/players/leagueTopScorersRoutes.js");
// const leagueTopAssistsRoutes = require("./routes/players/leagueTopAssistsRoutes.js");
// const leaguePlayerYellowCardsRoutes = require("./routes/players/leaguePlayerYellowCardsRoutes");
// const leaguePlayerRedCardsRoutes = require("./routes/players/leaguePlayerRedCardsRoutes");
// const roundsRoutes = require("./routes/fixtures/roundsRoutes");






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
app.use("/api", routes);

// app.use("/api/teams", teamRoutes);
// app.use("/api/venues", venueRoutes);
// app.use("/api/teamsStats", teamsStatsRoutes)
// app.use("/api/teamForm", teamFormRoutes);
// app.use("/api/teamPlayers", teamPlayersRoutes);
// app.use("/api/playersRoutes", playersRoutes)
// app.use("/api/leagues", leagueRoutes);
// app.use("/players/profiles", playersProfilesRoutes);
// app.use("/players/squads", playersSquadsRoutes);
// app.use("/players/teams", playersTeamsRoutes);
// app.use("/api/topscorers", leagueTopScorersRoutes);
// app.use("/api/topassists", leagueTopAssistsRoutes);
// app.use("/api/yellowcards", leaguePlayerYellowCardsRoutes);
// app.use("/api/redcards", leaguePlayerRedCardsRoutes);
// app.use("/api/rounds", roundsRoutes);





module.exports = app;

