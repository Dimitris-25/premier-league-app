const express = require("express");
const router = express.Router();

const {
  fetchTopAssistsLeague,
  fetchAllTopAssistsData,
} = require("../../controllers/players/leagueTopAssistsController");

// 📖 Fetch top assists by league + season
// Παράδειγμα: GET /api/topassists/39/2025
router.get("/:league_id/:season_id", fetchTopAssistsLeague);

// 📖 Fetch all top assists (όλων των λιγκών/σεζόν)
// Παράδειγμα: GET /api/topassists
router.get("/", fetchAllTopAssistsData);

module.exports = router;
