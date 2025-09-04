const pool = require("../../config/db");

// 📖 Fetch Yellow Cards by League & Season
async function fetchYellowCardsByLeague(league_id, season_id) {
  const sql = `
    SELECT *
    FROM player_yellowcards
    WHERE league_id = ? AND season_id = ?
    ORDER BY total_yellow DESC
  `;
  const [rows] = await pool.query(sql, [league_id, season_id]);
  return rows;
}

// 📖 Fetch All Yellow Cards (για όλες τις λίγκες/σεζόν)
async function fetchAllYellowCards() {
  const sql = `
    SELECT *
    FROM player_yellowcards
    ORDER BY league_id, season_id, ranking
  `;
  const [rows] = await pool.query(sql);
  return rows;
}

module.exports = {
  fetchYellowCardsByLeague,
  fetchAllYellowCards,
};
