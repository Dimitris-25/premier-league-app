const pool = require("../../config/db");

// 📖 Fetch Red Cards by League & Season
async function fetchRedCardsByLeague(league_id, season_id) {
  const sql = `
    SELECT *
    FROM player_redcards
    WHERE league_id = ? AND season_id = ?
    ORDER BY total_red DESC
  `;
  const [rows] = await pool.query(sql, [league_id, season_id]);
  return rows;
}

// 📖 Fetch All Red Cards (για όλες τις λίγκες/σεζόν)
async function fetchAllRedCards() {
  const sql = `
    SELECT *
    FROM player_redcards
    ORDER BY league_id, season_id, ranking
  `;
  const [rows] = await pool.query(sql);
  return rows;
}

module.exports = {
  fetchRedCardsByLeague,
  fetchAllRedCards,
};
