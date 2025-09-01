const express = require('express');
const app = express()
const testRoutes = require("./routes/testRoutes");
const logger = require('./logger'); 
const teamRoutes = require("./routes/teamRoutes");  
const venueRoutes = require("./routes/venueRoutes");
const teamsStatsRoutes = require("./routes/teamsStatsRoutes");
const teamFormRoutes = require("./routes/teamFormRoutes");




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




module.exports = app;

