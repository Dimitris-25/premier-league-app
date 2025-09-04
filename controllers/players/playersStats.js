// controllers/players/playerStatsController.js
const axios = require("axios");
const {
  insertPlayerStats,
  getPlayerStats,
  getAllPlayerStats,
  updatePlayerStats,
  deletePlayerStats,
} = require("../../models/players/playerStats");

const API_KEY = process.env.FOOTBALL_API_KEY;

// ⏱ Helper για API rate limit
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 🔄 Fetch από API και αποθήκευση στη DB
async function fetchAndSavePlayerStats(req, res) {
  try {
    const season = req.params.season || 2025;
    const fixtureId = req.params.fixture_id;

    let page = 1;
    let totalPages = 1;
    let totalInserted = 0;

    while (page <= totalPages) {
      console.log(`📥 Fetching page ${page}/${totalPages} of player stats...`);

      const response = await axios.get("https://v3.football.api-sports.io/players", {
         headers: { "x-apisports-key": API_KEY },
         params: {
          league: 39,          // Premier League
          season: 2025,        // τρέχουσα season
          page: page,          // pagination
          },

      });

      const data = response.data.response;
      totalPages = response.data.paging.total;

      for (const team of data) {
        for (const player of team.players) {
          await insertPlayerStats({
            player_id: player.player.id,
            fixture_id: fixtureId,
            minutes: player.statistics[0].games.minutes || 0,
            position: player.statistics[0].games.position || null,
            rating: player.statistics[0].games.rating || null,
            shots_total: player.statistics[0].shots.total || 0,
            goals_total: player.statistics[0].goals.total || 0,
            assists: player.statistics[0].goals.assists || 0,
            passes_total: player.statistics[0].passes.total || 0,
            tackles_total: player.statistics[0].tackles.total || 0,
          });
          totalInserted++;
        }
      }

      page++;
      await delay(300); // ⏱ Rate limit
    }

    res.json({
      message: `✅ Imported ${totalInserted} player stats for fixture ${fixtureId} (season ${season})`,
    });
  } catch (err) {
    console.error("❌ Error fetching player stats:", err);
    res.status(500).json({ error: "Failed to fetch and save player stats" });
  }
}

// ➕ Create (DB)
async function createPlayerStats(req, res) {
  try {
    const stats = req.body;
    await insertPlayerStats(stats);
    res.status(201).json({ message: "✅ Player stats created/updated successfully" });
  } catch (err) {
    console.error("❌ Error creating player stats:", err);
    res.status(500).json({ error: "Failed to create/update player stats" });
  }
}

// 📖 Fetch (DB) by player_id
async function fetchPlayerStats(req, res) {
  try {
    const { player_id } = req.params;
    const stats = await getPlayerStats(player_id);

    if (!stats || stats.length === 0) {
      return res.status(404).json({ message: "Player stats not found" });
    }

    res.json(stats);
  } catch (err) {
    console.error("❌ Error fetching player stats:", err);
    res.status(500).json({ error: "Failed to fetch player stats" });
  }
}

// 📖 Fetch all (DB)
async function fetchAllPlayerStats(req, res) {
  try {
    const stats = await getAllPlayerStats();
    res.json(stats);
  } catch (err) {
    console.error("❌ Error fetching all player stats:", err);
    res.status(500).json({ error: "Failed to fetch all player stats" });
  }
}

// ✏️ Edit (DB)
async function editPlayerStats(req, res) {
  try {
    const { player_id, fixture_id } = req.params;
    const updates = { ...req.body, player_id, fixture_id };

    const result = await updatePlayerStats(updates);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Player stats not found" });
    }

    res.json({ message: "✅ Player stats updated successfully" });
  } catch (err) {
    console.error("❌ Error updating player stats:", err);
    res.status(500).json({ error: "Failed to update player stats" });
  }
}

// ❌ Remove (DB)
async function removePlayerStats(req, res) {
  try {
    const { player_id, fixture_id } = req.params;
    const result = await deletePlayerStats(player_id, fixture_id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Player stats not found" });
    }

    res.json({ message: "✅ Player stats deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting player stats:", err);
    res.status(500).json({ error: "Failed to delete player stats" });
  }
}

module.exports = {
  fetchAndSavePlayerStats, // API → DB
  createPlayerStats,       // DB
  fetchPlayerStats,        // DB
  fetchAllPlayerStats,     // DB
  editPlayerStats,         // DB
  removePlayerStats,       // DB
};
