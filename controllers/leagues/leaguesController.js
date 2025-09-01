// controllers/leagues/leaguesController.js
const axios = require("axios");
const {
  insertLeague,
  getAllLeagues,
  getLeagueById,
  updateLeague,
  deleteLeague,
} = require("../../models/leagues/leagues");

// short delay to avoid API rate limits
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 🔄 Import all leagues from API and save into DB
async function fetchAndSaveAllLeagues(req, res) {
  try {
    console.log("🌍 Fetching all leagues from API...");

    const response = await axios.get("https://v3.football.api-sports.io/leagues", {
      params: { id: 39 },
      headers: { "x-apisports-key": process.env.FOOTBALL_API_KEY },
    });

    const leagues = response.data.response;
    let totalInserted = 0;

    for (const item of leagues) {
      const league = item.league;
      const country = item.country;

      await insertLeague({
        league_id: league.id,
        name: league.name,
        country: country.name,
        code: country.code,
        logo: league.logo,
        flag: country.flag,
      });

      totalInserted++;
      await delay(200); // avoid hitting API limits
    }

    res.json({ message: `🎉 Imported ${totalInserted} leagues successfully` });
  } catch (err) {
    console.error("❌ Error importing leagues:", err);
    res.status(500).json({ error: "Failed to import leagues" });
  }
}




// 📖 Get all leagues
async function fetchAllLeagues(req, res) {
  try {
    const leagues = await getAllLeagues();
    res.json(leagues);
  } catch (err) {
    console.error("❌ Error fetching leagues:", err);
    res.status(500).json({ error: "Failed to fetch leagues" });
  }
}

// 📖 Get league by ID
async function fetchLeagueById(req, res) {
  try {
    const league = await getLeagueById(req.params.id);
    if (!league) {
      return res.status(404).json({ error: "League not found" });
    }
    res.json(league);
  } catch (err) {
    console.error("❌ Error fetching league:", err);
    res.status(500).json({ error: "Failed to fetch league" });
  }
}

// ➕ Create league manually
async function createLeague(req, res) {
  try {
    await insertLeague(req.body);
    res.json({ message: "✅ League created" });
  } catch (err) {
    console.error("❌ Error creating league:", err);
    res.status(500).json({ error: "Failed to create league" });
  }
}

// ✏️ Update league
async function editLeague(req, res) {
  try {
    await updateLeague(req.params.id, req.body);
    res.json({ message: "✅ League updated" });
  } catch (err) {
    console.error("❌ Error updating league:", err);
    res.status(500).json({ error: "Failed to update league" });
  }
}

// 🗑️ Delete league
async function removeLeague(req, res) {
  try {
    await deleteLeague(req.params.id);
    res.json({ message: "🗑️ League deleted" });
  } catch (err) {
    console.error("❌ Error deleting league:", err);
    res.status(500).json({ error: "Failed to delete league" });
  }
}

module.exports = {
  fetchAndSaveAllLeagues,
  fetchAllLeagues,
  fetchLeagueById,
  createLeague,
  editLeague,
  removeLeague,
};
