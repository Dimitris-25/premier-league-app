const express = require("express");
const router = express.Router();

const {
  fetchYellowCardsLeague,
  fetchAllYellowCardsData,
} = require("../../controllers/players/leaguePlayerYellowCardsController");

// 📖 Fetch yellow cards by league + season
// Παράδειγμα: GET /api/yellowcards/39/2025
router.get("/:league_id/:season_id", fetchYellowCardsLeague);

// 📖 Fetch all yellow cards (όλων των λιγκών/σεζόν)
// Παράδειγμα: GET /api/yellowcards
router.get("/", fetchAllYellowCardsData);

module.exports = router;
