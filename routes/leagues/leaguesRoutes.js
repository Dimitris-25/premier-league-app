// routes/leagues/leaguesRoutes.js
const express = require("express");
const {
  fetchAndSaveAllLeagues,
  fetchAllLeagues,
  fetchLeagueById,
  createLeague,
  editLeague,
  removeLeague,
} = require("../../controllers/leagues/leaguesController");

const router = express.Router();

// ➕ Δημιουργία νέου league (χειροκίνητα)
router.post("/", createLeague);

// 📖 Εμφάνιση όλων των leagues
router.get("/", fetchAllLeagues);

// 📖 Εμφάνιση league με βάση το ID
router.get("/:id", fetchLeagueById);

// 🔄 Import όλων των leagues από API
router.get("/import/all", fetchAndSaveAllLeagues);

// ✏️ Ενημέρωση league
router.put("/:id", editLeague);

// 🗑️ Διαγραφή league
router.delete("/:id", removeLeague);

module.exports = router;
