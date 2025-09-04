const axios = require("axios");
const {
  insertRound,
  fetchRoundById,
  fetchAllRounds,
  updateRound,
  deleteRound,
} = require("../../models/fixtures/rounds");

const API_KEY = process.env.FOOTBALL_API_KEY;

// ⏳ Helper για rate limit
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 🔄 Fetch από API-Football και αποθήκευση στη DB
async function fetchAndSaveRounds(req, res) {
  try {
    const { league_id, season } = req.params;

    const response = await axios.get("https://v3.football.api-sports.io/fixtures/rounds", {
      headers: { "x-apisports-key": API_KEY },
      params: { league: league_id, season },
    });

    const data = response.data.response;
    let totalInserted = 0;

    for (const round of data) {
      // API επιστρέφει π.χ. "Regular Season - 1"
      // Εδώ μπορούμε να πάρουμε μόνο τον αριθμό με regex
      const roundNumber = parseInt(round.match(/\d+/)?.[0] || 0);

      await insertRound({
        league_id,
        season_id: season, // ⚠️ αν το season είναι string/year πρέπει να το κάνεις map σε season_id
        round: roundNumber,
      });

      totalInserted++;
      await delay(1500); // 🔹 αναμονή για το rate limit
    }

    res.json({ message: `✅ Imported ${totalInserted} rounds for league ${league_id}, season ${season}` });
  } catch (err) {
    console.error("❌ Error importing rounds:", err);
    res.status(500).json({ error: "Failed to import rounds" });
  }
}

// 📖 Fetch Round by ID (DB)
async function fetchRound(req, res) {
  try {
    const { round_id } = req.params;
    const round = await fetchRoundById(round_id);

    if (!round) {
      return res.status(404).json({ message: "Round not found" });
    }

    res.json(round);
  } catch (err) {
    console.error("❌ Error fetching round:", err);
    res.status(500).json({ error: "Failed to fetch round" });
  }
}

// 📖 Fetch all Rounds (DB)
async function fetchRounds(req, res) {
  try {
    const rounds = await fetchAllRounds();
    res.json(rounds);
  } catch (err) {
    console.error("❌ Error fetching rounds:", err);
    res.status(500).json({ error: "Failed to fetch rounds" });
  }
}

// ✏️ Update Round (DB)
async function editRound(req, res) {
  try {
    const result = await updateRound(req.body);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Round not found" });
    }

    res.json({ message: "✅ Round updated successfully" });
  } catch (err) {
    console.error("❌ Error updating round:", err);
    res.status(500).json({ error: "Failed to update round" });
  }
}

// ❌ Delete Round (DB)
async function removeRound(req, res) {
  try {
    const { round_id } = req.params;
    const result = await deleteRound(round_id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Round not found" });
    }

    res.json({ message: "✅ Round deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting round:", err);
    res.status(500).json({ error: "Failed to delete round" });
  }
}

module.exports = {
  fetchAndSaveRounds, // API → DB
  fetchRound,         // DB
  fetchRounds,        // DB
  editRound,          // DB
  removeRound,        // DB
};
