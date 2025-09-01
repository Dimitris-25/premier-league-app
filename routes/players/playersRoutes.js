const express = require("express");
const {
  fetchAndSaveAllPlayers,
  fetchAllPlayers,
  fetchPlayerById,
  createPlayer,
  updatePlayerController,
  deletePlayerController,
} = require("../../controllers/players/playersController");

const router = express.Router();

// ➕ Create a new player
router.post("/", createPlayer);

// 📖 Get all players
router.get("/", fetchAllPlayers);

// 📖 Get a player by ID
router.get("/:id", fetchPlayerById);

// 📥 Import all players from API
router.get("/import/:season", fetchAndSaveAllPlayers);

// ✏️ Update a player
router.put("/:id", updatePlayerController);

// 🗑️ Delete a player
router.delete("/:id", deletePlayerController);

module.exports = router;
