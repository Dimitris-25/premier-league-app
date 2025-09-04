const axios = require("axios");
const {
  insertSquadPlayer,
  fetchSquadByTeam,
  fetchAllSquads,
  updateSquadPlayer,
  deleteSquadPlayer,
} = require("../../models/players/playersSquads");

const API_KEY = process.env.FOOTBALL_API_KEY;

// ⏳ Helper delay για rate limit
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 🔄 Fetch από API και αποθήκευση στη DB
async function fetchAndSaveSquad(req, res) {
  try {
    const { team_id, season } = req.params;

    const response = await axios.get("https://v3.football.api-sports.io/players", {
      headers: { "x-apisports-key": API_KEY },
      params: { team: team_id, season }
    });

    const players = response.data.response;
    let totalInserted = 0;

    for (const player of players) {
      await insertSquadPlayer({
        team_id,
        player_id: player.player.id,
        name: player.player.name,
        age: player.player.age || null,
        number: player.statistics[0]?.games.number || null,
        position: player.statistics[0]?.games.position || null,
        photo: player.player.photo || null,
      });
      totalInserted++;
      await delay(1500); // μικρή καθυστέρηση
    }

    res.json({ message: `✅ Imported ${totalInserted} players for team ${team_id} season ${season}` });
  } catch (err) {
    console.error("❌ Error fetching squad:", err);
    res.status(500).json({ error: "Failed to fetch squad" });
  }
}

// ➕ Create (DB)
async function createSquadPlayer(req, res) {
  try {
    await insertSquadPlayer(req.body);
    res.status(201).json({ message: "✅ Squad player created/updated successfully" });
  } catch (err) {
    console.error("❌ Error creating squad player:", err);
    res.status(500).json({ error: "Failed to create squad player" });
  }
}

// 📖 Fetch by team (DB)
async function fetchSquad(req, res) {
  try {
    const { team_id } = req.params;
    const squad = await fetchSquadByTeam(team_id);

    if (!squad || squad.length === 0) {
      return res.status(404).json({ message: "Squad not found" });
    }
    res.json(squad);
  } catch (err) {
    console.error("❌ Error fetching squad:", err);
    res.status(500).json({ error: "Failed to fetch squad" });
  }
}

// 📖 Fetch all (DB)
async function fetchAllSquadsController(req, res) {
  try {
    const squads = await fetchAllSquads();
    res.json(squads);
  } catch (err) {
    console.error("❌ Error fetching all squads:", err);
    res.status(500).json({ error: "Failed to fetch squads" });
  }
}

// ✏️ Update (DB)
async function editSquadPlayer(req, res) {
  try {
    const result = await updateSquadPlayer(req.body);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Squad player not found" });
    }
    res.json({ message: "✅ Squad player updated successfully" });
  } catch (err) {
    console.error("❌ Error updating squad player:", err);
    res.status(500).json({ error: "Failed to update squad player" });
  }
}

// ❌ Delete (DB)
async function removeSquadPlayer(req, res) {
  try {
    const { team_id, player_id } = req.params;
    const result = await deleteSquadPlayer(team_id, player_id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Squad player not found" });
    }
    res.json({ message: "✅ Squad player deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting squad player:", err);
    res.status(500).json({ error: "Failed to delete squad player" });
  }
}

module.exports = {
  fetchAndSaveSquad,
  createSquadPlayer,
  fetchSquad,
  fetchAllSquadsController,
  editSquadPlayer,
  removeSquadPlayer,
};
