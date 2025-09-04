const pool = require("../../config/db");

// 📖 Fetch Top Scorers by League & Season
async function fetchTopScorersByLeague(league_id, season_id) {
  const sql = `
    SELECT *
    FROM player_topscorers
    WHERE league_id = ? AND season_id = ?
    ORDER BY total_goals DESC
  `;
  const [rows] = await pool.query(sql, [league_id, season_id]);
  return rows;
}

// 📖 Fetch All Top Scorers (για όλες τις λίγκες/σεζόν)
async function fetchAllTopScorers() {
  const sql = `
    SELECT *
    FROM player_topscorers
    ORDER BY league_id, season_id, ranking
  `;
  const [rows] = await pool.query(sql);
  return rows;
}

module.exports = {
  fetchTopScorersByLeague,
  fetchAllTopScorers,
};
