// controllers/players/playersProfilesController.js
const axios = require("axios");
const {
  insertPlayersProfile,
  getPlayerProfile,
  updatePlayerProfile,
  deletePlayerProfile,
} = require("../../models/players/playersProfiles");

const API_KEY = process.env.FOOTBALL_API_KEY;

// 🔄 Fetch από API και αποθήκευση στη DB
const fs = require("fs");
const path = require("path");

async function fetchAndSavePlayerProfiles(req, res) {
  try {
    // 🔹 Διαβάζουμε από το τοπικό JSON
    const rawData = fs.readFileSync(
      path.join(__dirname, "../../files/playersProfilesPremier.json"),
      "utf-8"
    );

    const jsonData = JSON.parse(rawData);

    // 🔹 Παίρνουμε μόνο το response array
    const players = jsonData.response;

    if (!Array.isArray(players)) {
      throw new Error("Invalid JSON format: response is not an array");
    }

    let totalInserted = 0;

    for (const p of players) {
      await insertPlayersProfile({
        player_id: p.player.id,
        nationality_id:  null, //lookup από πίνακα countries
        preferred_foot: p.player.preferred_foot || null,
        market_value: p.player.market_value || null,
      });

      totalInserted++;
    }

    res.json({
      message: `✅ Imported ${totalInserted} player profiles from JSON file`,
    });
  } catch (err) {
    console.error("❌ Error importing player profiles:", err.message);
    res.status(500).json({ error: "Failed to import player profiles" });
  }
}



// ➕ Create (DB)
async function createPlayerProfile(req, res) {
  try {
    const profile = req.body;
    await insertPlayersProfile(profile);
    res.status(201).json({ message: "✅ Player profile created/updated successfully" });
  } catch (err) {
    console.error("❌ Error creating player profile:", err);
    res.status(500).json({ error: "Failed to create/update player profile" });
  }
}

// 📖 Fetch (DB)
async function fetchPlayerProfile(req, res) {
  try {
    const { player_id } = req.params;
    const profile = await getPlayerProfile(player_id);

    if (!profile || profile.length === 0) {
      return res.status(404).json({ message: "Player profile not found" });
    }

    res.json(profile);
  } catch (err) {
    console.error("❌ Error fetching player profile:", err);
    res.status(500).json({ error: "Failed to fetch player profile" });
  }
}

// ✏️ Edit (DB)
async function editPlayerProfile(req, res) {
  try {
    const { player_id } = req.params;
    const updates = { ...req.body, player_id };

    const result = await updatePlayerProfile(updates);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Player profile not found" });
    }

    res.json({ message: "✅ Player profile updated successfully" });
  } catch (err) {
    console.error("❌ Error updating player profile:", err);
    res.status(500).json({ error: "Failed to update player profile" });
  }
}

// ❌ Remove (DB)
async function removePlayerProfile(req, res) {
  try {
    const { profile_id } = req.params;
    const result = await deletePlayerProfile(profile_id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Player profile not found" });
    }

    res.json({ message: "✅ Player profile deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting player profile:", err);
    res.status(500).json({ error: "Failed to delete player profile" });
  }
}

module.exports = {
  fetchAndSavePlayerProfiles, // API → DB
  createPlayerProfile,        // DB
  fetchPlayerProfile,         // DB
  editPlayerProfile,          // DB
  removePlayerProfile,        // DB
};

