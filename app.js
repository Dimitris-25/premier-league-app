const express = require('express');
const pool = require("./db"); 
const app = express()
const testRoutes = require("./routes/test_routes");
const logger = require('./logger'); 
const teamRoutes = require("./routes/teamRoutes");  


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
app.use("/api", teamRoutes);

module.exports = app;

