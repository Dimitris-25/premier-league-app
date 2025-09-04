const pool = require("../../config/db");

// 📖 Fetch Top Assists by League & Season
async function fetchTopAssistsByLeague(league_id, season_id) {
  const sql = `
    SELECT *
    FROM player_topassists
    WHERE league_id = ? AND season_id = ?
    ORDER BY total_assists DESC
  `;
  const [rows] = await pool.query(sql, [league_id, season_id]);
  return rows;
}

// 📖 Fetch All Top Assists (για όλες τις λίγκες/σεζόν)
async function fetchAllTopAssists() {
  const sql = `
    SELECT *
    FROM player_topassists
    ORDER BY league_id, season_id, ranking
  `;
  const [rows] = await pool.query(sql);
  return rows;
}

module.exports = {
  fetchTopAssistsByLeague,
  fetchAllTopAssists,
};
