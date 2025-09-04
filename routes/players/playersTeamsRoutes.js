const express = require("express");
const router = express.Router();

const {
  fetchAndSavePlayerTeams,
  createPlayerTeam,
  getTeamsByPlayer,
  getAllPlayersTeams,
  editPlayerTeam,
  removePlayerTeam,
} = require("../../controllers/players/playersTeamsController");

// 🔄 Fetch από API & αποθήκευση στη DB
// π.χ. GET /api/players/teams/fetch/45/2025
router.get("/fetch/:player_id/:season", fetchAndSavePlayerTeams);

// ➕ Create player-team (DB)
router.post("/", createPlayerTeam);

// 📖 Fetch όλες τις ομάδες ενός παίκτη (DB)
router.get("/:player_id", getTeamsByPlayer);

// 📖 Fetch όλα τα player-teams (DB)
router.get("/", getAllPlayersTeams);

// ✏️ Update player-team (DB)
router.put("/", editPlayerTeam);

// ❌ Delete player-team (DB)
router.delete("/:player_id/:team_id", removePlayerTeam);

module.exports = router;
