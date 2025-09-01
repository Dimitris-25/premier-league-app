const axios = require("axios");
const {
  insertPlayer,
  getAllPlayers,
  getPlayerById,
  updatePlayer: updatePlayerInDB,
  deletePlayer: deletePlayerFromDB,
} = require("../../models/players/players");

// short pause so the API doesn't interrupt you
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ✅ Import all players of Premier League
async function fetchAndSaveAllPlayers(req, res) {
  try {
    const season = req.params.season || 2025;
    let page = 1;
    let totalPages = 1;
    let totalInserted = 0;

    while (page <= totalPages) {
      console.log(`📂 Fetching page ${page}/${totalPages} of players...`);

      const response = await axios.get("https://v3.football.api-sports.io/players", {
        params: {
          league: 39,      // Premier League
          season: season,  // default 2025
          page: page,
        },
        headers: {
          "x-apisports-key": process.env.API_KEY,
        },
      });

      const data = response.data;
      totalPages = data.paging.total;

      console.log(`✅ Received ${data.response.length} players from page ${page}`);

      for (const item of data.response) {
        const player = item.player;
        const stats = item.statistics[0];

        await insertPlayer({
          player_id: player.id,
          firstname: player.firstname,
          lastname: player.lastname,
          age: player.age,
          birth_date: player.birth.date,
          height: player.height,
          weight: player.weight,
          injured: player.injured,
          photo: player.photo,
          team_id: stats.team.id,
        });

        totalInserted++;
      }

      page++;
      await delay(300); // API rate limit
    }

    res.json({
      message: `🎉 Imported ${totalInserted} players for Premier League ${season}`,
    });
  } catch (err) {
    console.error("❌ Error importing players:", err);
    res.status(500).json({ error: "Failed to import all players" });
  }
}

// 📖 Get all players
async function fetchAllPlayers(req, res) {
  try {
    const players = await getAllPlayers();
    res.json(players);
  } catch (err) {
    console.error("❌ Error fetching all players:", err);
    res.status(500).json({ error: "Failed to fetch players" });
  }
}

// 📖 Get player by ID
async function fetchPlayerById(req, res) {
  try {
    const player = await getPlayerById(req.params.id);
    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }
    res.json(player);
  } catch (err) {
    console.error("❌ Error fetching player:", err);
    res.status(500).json({ error: "Failed to fetch player" });
  }
}

// ➕ Create new player manually
async function createPlayer(req, res) {
  try {
    await insertPlayer(req.body);
    res.json({ message: "✅ Player created" });
  } catch (err) {
    console.error("❌ Error creating player:", err);
    res.status(500).json({ error: "Failed to create player" });
  }
}

// ✏️ Update player
async function updatePlayerController(req, res) {
  try {
    await updatePlayerInDB(req.params.id, req.body);
    res.json({ message: "✅ Player updated" });
  } catch (err) {
    console.error("❌ Error updating player:", err);
    res.status(500).json({ error: "Failed to update player" });
  }
}

// 🗑️ Delete player
async function deletePlayerController(req, res) {
  try {
    await deletePlayerFromDB(req.params.id);
    res.json({ message: "🗑️ Player deleted" });
  } catch (err) {
    console.error("❌ Error deleting player:", err);
    res.status(500).json({ error: "Failed to delete player" });
  }
}

module.exports = {
  fetchAndSaveAllPlayers,
  fetchAllPlayers,
  fetchPlayerById,
  createPlayer,
  updatePlayerController,
  deletePlayerController,
};
