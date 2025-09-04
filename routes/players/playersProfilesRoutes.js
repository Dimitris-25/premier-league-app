const express = require("express");
const router = express.Router();

const {
  fetchAndSavePlayerProfiles,
  createPlayerProfile,
  fetchPlayerProfile,
  editPlayerProfile,
  removePlayerProfile
} = require("../../controllers/players/playersProfilesController");

// 📥 Import από JSON/API στη βάση
router.get("/import", fetchAndSavePlayerProfiles);

// ➕ Δημιουργία παίκτη
router.post("/", createPlayerProfile);

// 📤 Φέρε όλους ή έναν παίκτη
router.get("/", fetchPlayerProfile);     // όλοι
router.get("/:id", fetchPlayerProfile);  // ένας

// ✏️ Update παίκτη
router.put("/:id", editPlayerProfile);

// 🗑️ Διαγραφή παίκτη
router.delete("/:id", removePlayerProfile);

console.log("✅ playersProfilesRoutes loaded");


module.exports = router;
