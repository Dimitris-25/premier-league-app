const express = require("express");
const router = express.Router();

const {
  fetchRedCardsLeague,
  fetchAllRedCardsData,
} = require("../../controllers/players/leaguePlayerRedCardsController");

// 📖 Fetch red cards by league + season
// Παράδειγμα: GET /api/redcards/39/2025
router.get("/:league_id/:season_id", fetchRedCardsLeague);

// 📖 Fetch all red cards (όλων των λιγκών/σεζόν)
// Παράδειγμα: GET /api/redcards
router.get("/", fetchAllRedCardsData);

module.exports = router;
