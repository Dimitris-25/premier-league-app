const {
  fetchRedCardsByLeague,
  fetchAllRedCards,
} = require("../../models/players/leaguePlayerRedCards");

// 📖 Fetch Red Cards by League + Season (DB / View)
async function fetchRedCardsLeague(req, res) {
  try {
    const { league_id, season_id } = req.params;
    const cards = await fetchRedCardsByLeague(league_id, season_id);

    if (!cards || cards.length === 0) {
      return res.status(404).json({ message: "Red cards not found" });
    }

    res.json(cards);
  } catch (err) {
    console.error("❌ Error fetching red cards:", err);
    res.status(500).json({ error: "Failed to fetch red cards" });
  }
}

// 📖 Fetch All Red Cards (DB / View)
async function fetchAllRedCardsData(req, res) {
  try {
    const all = await fetchAllRedCards();

    if (!all || all.length === 0) {
      return res.status(404).json({ message: "No red cards data found" });
    }

    res.json(all);
  } catch (err) {
    console.error("❌ Error fetching all red cards:", err);
    res.status(500).json({ error: "Failed to fetch all red cards" });
  }
}

module.exports = {
  fetchRedCardsLeague,   // DB / View
  fetchAllRedCardsData,  // DB / View
};
