const express = require("express");


const {
  createTeamPlayer,
  fetchAllTeamPlayers,
  fetchTeamPlayerById,
  fetchPlayersByTeam,
  editTeamPlayer,
  removeTeamPlayer,
  fetchAndSaveAllPlayers
} = require("../../controllers/teams/teamPlayersController");

const router = express.Router();

// ➕ Create a new team player
router.post("/", createTeamPlayer);

// 📥 Import all players from API
router.get("/importAll/:season", fetchAndSaveAllPlayers);


// 📥 Get all team players
router.get("/", fetchAllTeamPlayers);

// 📥 Get a player by record ID
router.get("/:id", fetchTeamPlayerById);

// 📥 Get players of a team for a given season
router.get("/team/:team_id/season/:season", fetchPlayersByTeam);

// ✏️ Update a player record
router.put("/:id", editTeamPlayer);

// 🗑️ Delete a player record
router.delete("/:id", removeTeamPlayer);

module.exports = router;
