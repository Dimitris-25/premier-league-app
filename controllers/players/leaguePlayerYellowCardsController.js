const {
  fetchYellowCardsByLeague,
  fetchAllYellowCards,
} = require("../../models/players/leaguePlayerYellowCards");

// 📖 Fetch Yellow Cards by League + Season (DB / View)
async function fetchYellowCardsLeague(req, res) {
  try {
    const { league_id, season_id } = req.params;
    const cards = await fetchYellowCardsByLeague(league_id, season_id);

    if (!cards || cards.length === 0) {
      return res.status(404).json({ message: "Yellow cards not found" });
    }

    res.json(cards);
  } catch (err) {
    console.error("❌ Error fetching yellow cards:", err);
    res.status(500).json({ error: "Failed to fetch yellow cards" });
  }
}

// 📖 Fetch All Yellow Cards (DB / View)
async function fetchAllYellowCardsData(req, res) {
  try {
    const all = await fetchAllYellowCards();

    if (!all || all.length === 0) {
      return res.status(404).json({ message: "No yellow cards data found" });
    }

    res.json(all);
  } catch (err) {
    console.error("❌ Error fetching all yellow cards:", err);
    res.status(500).json({ error: "Failed to fetch all yellow cards" });
  }
}

module.exports = {
  fetchYellowCardsLeague,   // DB / View
  fetchAllYellowCardsData,  // DB / View
};
