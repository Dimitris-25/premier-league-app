const express = require("express");
const router = express.Router();

const {
  fetchAndSaveRounds,
  fetchRound,
  fetchRounds,
  editRound,
  removeRound,
} = require("../../controllers/fixtures/roundsController");

// 🔄 Fetch & Save rounds από API-Football στη DB
// Παράδειγμα: GET /api/rounds/import/39/2025
router.get("/import/:league_id/:season", fetchAndSaveRounds);

// 📖 Fetch όλα τα rounds από DB
// Παράδειγμα: GET /api/rounds
router.get("/", fetchRounds);

// 📖 Fetch round by ID
// Παράδειγμα: GET /api/rounds/1
router.get("/:round_id", fetchRound);

// ✏️ Update round
// Παράδειγμα: PUT /api/rounds
router.put("/", editRound);

// ❌ Delete round
// Παράδειγμα: DELETE /api/rounds/1
router.delete("/:round_id", removeRound);

module.exports = router;
