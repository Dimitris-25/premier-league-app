const axios = require("axios");
const {
  insertPlayerTeam,
  fetchTeamsByPlayer,
  fetchAllPlayersTeams,
  updatePlayerTeam,
  deletePlayerTeam,
} = require("../../models/players/playersTeams");

const API_KEY = process.env.FOOTBALL_API_KEY;

// ⏳ Helper delay για rate limit
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 🔄 Fetch από API και αποθήκευση στη DB
async function fetchAndSavePlayerTeams(req, res) {
  try {
    const { player_id, season } = req.params;

    const response = await axios.get("https://v3.football.api-sports.io/players/teams", {
      headers: { "x-apisports-key": API_KEY },
      params: { player: player_id, season }
    });

    const teams = response.data.response;
    let totalInserted = 0;

    for (const t of teams) {
      await insertPlayerTeam({
        player_id,
        team_id: t.team.id,
        season: season,
      });
      totalInserted++;
      await delay(1500); // μικρή καθυστέρηση
    }

    res.json({ message: `✅ Imported ${totalInserted} teams for player ${player_id} season ${season}` });
  } catch (err) {
    console.error("❌ Error fetching player-teams:", err);
    res.status(500).json({ error: "Failed to fetch player-teams" });
  }
}

// ➕ Create (DB)
async function createPlayerTeam(req, res) {
  try {
    await insertPlayerTeam(req.body);
    res.status(201).json({ message: "✅ Player-Team created/updated successfully" });
  } catch (err) {
    console.error("❌ Error creating player-team:", err);
    res.status(500).json({ error: "Failed to create player-team" });
  }
}

// 📖 Fetch by player (DB)
async function getTeamsByPlayer(req, res) {
  try {
    const { player_id } = req.params;
    const teams = await fetchTeamsByPlayer(player_id);

    if (!teams || teams.length === 0) {
      return res.status(404).json({ message: "Player-Team not found" });
    }
    res.json(teams);
  } catch (err) {
    console.error("❌ Error fetching teams by player:", err);
    res.status(500).json({ error: "Failed to fetch player-teams" });
  }
}

// 📖 Fetch all (DB)
async function getAllPlayersTeams(req, res) {
  try {
    const all = await fetchAllPlayersTeams();
    res.json(all);
  } catch (err) {
    console.error("❌ Error fetching all player-teams:", err);
    res.status(500).json({ error: "Failed to fetch all player-teams" });
  }
}

// ✏️ Update (DB)
async function editPlayerTeam(req, res) {
  try {
    const result = await updatePlayerTeam(req.body);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Player-Team not found" });
    }
    res.json({ message: "✅ Player-Team updated successfully" });
  } catch (err) {
    console.error("❌ Error updating player-team:", err);
    res.status(500).json({ error: "Failed to update player-team" });
  }
}

// ❌ Delete (DB)
async function removePlayerTeam(req, res) {
  try {
    const { player_id, team_id } = req.params;
    const result = await deletePlayerTeam(player_id, team_id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Player-Team not found" });
    }
    res.json({ message: "✅ Player-Team deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting player-team:", err);
    res.status(500).json({ error: "Failed to delete player-team" });
  }
}

module.exports = {
  fetchAndSavePlayerTeams,
  createPlayerTeam,
  getTeamsByPlayer,
  getAllPlayersTeams,
  editPlayerTeam,
  removePlayerTeam,
};
