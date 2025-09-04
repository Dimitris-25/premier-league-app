const express = require("express");
const router = express.Router();

const {
  fetchTopScorersLeague,
  fetchAllTopScorersData,
} = require("../../controllers/players/leagueTopScorersController");

// 📖 Fetch top scorers by league + season
router.get("/:league_id/:season_id", fetchTopScorersLeague);

// 📖 Fetch all top scorers
router.get("/", fetchAllTopScorersData);

module.exports = router;
