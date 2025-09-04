const express = require("express");
const router = express.Router();

// Main player routes
router.use("/", require("./playersRoutes"));
router.use("/profiles", require("./playersProfilesRoutes"));
router.use("/squads", require("./playersSquadsRoutes"));
router.use("/teams", require("./playersTeamsRoutes"));

// Player performance routes
router.use("/topscorers", require("./leagueTopScorersRoutes"));
router.use("/topassists", require("./leagueTopAssistsRoutes"));
router.use("/yellowcards", require("./leaguePlayerYellowCardsRoutes"));
router.use("/redcards", require("./leaguePlayerRedCardsRoutes"));

module.exports = router;
