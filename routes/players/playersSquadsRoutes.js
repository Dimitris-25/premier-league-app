const express = require("express");
const router = express.Router();

const {
  fetchAndSaveSquad,
  createSquadPlayer,
  fetchSquad,
  fetchAllSquadsController,
  editSquadPlayer,
  removeSquadPlayer,
} = require("../../controllers/players/playersSquadsController");

// 🔄 Fetch & Save squad από API στη DB
// π.χ. GET /players/squads/fetch/33/2025
router.get("/fetch/:team_id/:season", fetchAndSaveSquad);

// ➕ Create squad player (DB)
router.post("/", createSquadPlayer);

// 📖 Fetch squad by team (DB)
router.get("/:team_id", fetchSquad);

// 📖 Fetch all squads (DB)
router.get("/", fetchAllSquadsController);

// ✏️ Update squad player (DB)
router.put("/:team_id/:player_id", editSquadPlayer);

// ❌ Delete squad player (DB)
router.delete("/:team_id/:player_id", removeSquadPlayer);

module.exports = router;
