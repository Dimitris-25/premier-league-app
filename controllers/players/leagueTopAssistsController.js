const {
  fetchTopAssistsByLeague,
  fetchAllTopAssists,
} = require("../../models/players/leaguePlayerTopAssists");

// 📖 Fetch Top Assists by League + Season (DB / View)
async function fetchTopAssistsLeague(req, res) {
  try {
    const { league_id, season_id } = req.params;
    const assists = await fetchTopAssistsByLeague(league_id, season_id);

    if (!assists || assists.length === 0) {
      return res.status(404).json({ message: "Top assists not found" });
    }

    res.json(assists);
  } catch (err) {
    console.error("❌ Error fetching top assists:", err);
    res.status(500).json({ error: "Failed to fetch top assists" });
  }
}

// 📖 Fetch All Top Assists (DB / View)
async function fetchAllTopAssistsData(req, res) {
  try {
    const all = await fetchAllTopAssists();

    if (!all || all.length === 0) {
      return res.status(404).json({ message: "No assists data found" });
    }

    res.json(all);
  } catch (err) {
    console.error("❌ Error fetching all top assists:", err);
    res.status(500).json({ error: "Failed to fetch all top assists" });
  }
}

module.exports = {
  fetchTopAssistsLeague,   // DB / View
  fetchAllTopAssistsData,  // DB / View
};
