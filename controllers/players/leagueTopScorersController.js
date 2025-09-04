const {
  fetchTopScorersByLeague,
  fetchAllTopScorers,
} = require("../../models/players/leagueTopScorers");


// 📖 Fetch Top Scorers by League + Season (DB / View)
async function fetchTopScorersLeague(req, res) {
  try {
    const { league_id, season_id } = req.params;
    const scorers = await fetchTopScorersByLeague(league_id, season_id);

    if (!scorers || scorers.length === 0) {
      return res.status(404).json({ message: "Top scorers not found" });
    }

    res.json(scorers);
  } catch (err) {
    console.error("❌ Error fetching top scorers:", err);
    res.status(500).json({ error: "Failed to fetch top scorers" });
  }
}

// 📖 Fetch All Top Scorers (DB / View)
async function fetchAllTopScorersData(req, res) {
  try {
    const all = await fetchAllTopScorers();

    if (!all || all.length === 0) {
      return res.status(404).json({ message: "No scorers data found" });
    }

    await delay(200);

    res.json(all);
  } catch (err) {
    console.error("❌ Error fetching all top scorers:", err);
    res.status(500).json({ error: "Failed to fetch all top scorers" });
  }
}

module.exports = {
  fetchTopScorersLeague,   // DB / View
  fetchAllTopScorersData,  // DB / View
};
