const axios = require("axios");

const {
  insertTeamPlayer,
  getAllTeamPlayers,
  getTeamPlayerById,
  getPlayersByTeam,
  updateTeamPlayer,
  deleteTeamPlayer,
} = require("../../models/teams/teamPlayers");

// Import all players of Premier League from API and save to DB
async function fetchAndSaveAllPlayers(req, res) {
  try {
    const season = req.params.season || 2025;
    let page = 1;
    let totalPages = 1;
    let totalInserted = 0;

    while (page <= totalPages) {
      console.log(`🔎 Fetching page ${page}/${totalPages} of players...`);
      console.log("🔑 API_KEY:", process.env.API_KEY);

      const response = await axios.get("https://v3.football.api-sports.io/players", {
        params: {
          league: 39,
          season: season,
          page: page
        },
        headers: {
          "x-apisports-key": process.env.API_KEY
        }
      });

      const data = response.data;
      totalPages = data.paging.total;

      console.log(`📥 Received ${data.response.length} players from page ${page}`);

      for (const item of data.response) {
        const player = item.player;
        const team = item.statistics[0]?.team;

        if (!team) continue;

        await insertTeamPlayer({
          team_id: team.id,
          player_id: player.id,
          season: season,
          position: player.position,
          number: player.number,
          captain: player.captain ? 1 : 0
        });

        totalInserted++;
      }

      page++;
    }

    console.log(`🎉 Imported ${totalInserted} players for Premier League ${season}`);
    res.json({ message: `Imported ${totalInserted} players for Premier League ${season}` });

  } catch (err) {
    console.error("❌ Error importing all players:", err.response?.data || err.message);
    res.status(500).json({ error: "Failed to import all players" });
  }
}



// ➕ Create a new team player
async function createTeamPlayer(req, res) {
  try {
    await insertTeamPlayer(req.body);
    res.status(201).json({ message: "✅ Player added to team" });
  } catch (err) {
    console.error("❌ Error in createTeamPlayer:", err);
    res.status(500).json({ error: "Failed to insert player" });
  }
}

// 📥 Get all team players
async function fetchAllTeamPlayers(req, res) {
  try {
    const players = await getAllTeamPlayers();
    res.json(players);
  } catch (err) {
    console.error("❌ Error in fetchAllTeamPlayers:", err);
    res.status(500).json({ error: "Failed to fetch players" });
  }
}

// 📥 Get a player by record ID
async function fetchTeamPlayerById(req, res) {
  try {
    const player = await getTeamPlayerById(req.params.id);
    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }
    res.json(player);
  } catch (err) {
    console.error("❌ Error in fetchTeamPlayerById:", err);
    res.status(500).json({ error: "Failed to fetch player" });
  }
}

// 📥 Get players of a team for a given season
async function fetchPlayersByTeam(req, res) {
  try {
    const { team_id, season } = req.params;
    const players = await getPlayersByTeam(team_id, season);
    res.json(players);
  } catch (err) {
    console.error("❌ Error in fetchPlayersByTeam:", err);
    res.status(500).json({ error: "Failed to fetch team players" });
  }
}

// ✏️ Update a player record
async function editTeamPlayer(req, res) {
  try {
    await updateTeamPlayer(req.params.id, req.body);
    res.json({ message: "✅ Player updated" });
  } catch (err) {
    console.error("❌ Error in editTeamPlayer:", err);
    res.status(500).json({ error: "Failed to update player" });
  }
}

// 🗑️ Delete a player record
async function removeTeamPlayer(req, res) {
  try {
    await deleteTeamPlayer(req.params.id);
    res.json({ message: "🗑️ Player deleted" });
  } catch (err) {
    console.error("❌ Error in removeTeamPlayer:", err);
    res.status(500).json({ error: "Failed to delete player" });
  }
}

module.exports = {
  fetchAndSaveAllPlayers,
  createTeamPlayer,
  fetchAllTeamPlayers,
  fetchTeamPlayerById,
  fetchPlayersByTeam,
  editTeamPlayer,
  removeTeamPlayer,
};
