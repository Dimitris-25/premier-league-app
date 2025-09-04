const pool = require("../../config/db");

// ➕ Insert player stats
async function insertPlayerStats(stats) {
  const sql = `
    INSERT INTO player_stats (
      player_id, fixture_id, minutes, position, rating,
      shots_total, goals_total, assists, passes_total, tackles_total
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      minutes = VALUES(minutes),
      position = VALUES(position),
      rating = VALUES(rating),
      shots_total = VALUES(shots_total),
      goals_total = VALUES(goals_total),
      assists = VALUES(assists),
      passes_total = VALUES(passes_total),
      tackles_total = VALUES(tackles_total)
  `;

  const values = [
    stats.player_id,
    stats.fixture_id,
    stats.minutes || 0,
    stats.position || null,
    stats.rating || null,
    stats.shots_total || 0,
    stats.goals_total || 0,
    stats.assists || 0,
    stats.passes_total || 0,
    stats.tackles_total || 0,
  ];

  await pool.query(sql, values);
}

// 📖 Get stats by player_id
async function getPlayerStats(player_id) {
  const sql = "SELECT * FROM player_stats WHERE player_id = ?";
  const [rows] = await pool.query(sql, [player_id]);
  return rows;
}

// 📖 Get all stats
async function getAllPlayerStats() {
  const sql = "SELECT * FROM player_stats";
  const [rows] = await pool.query(sql);
  return rows;
}

// ✏️ Update player stats
async function updatePlayerStats(stats) {
  const sql = `
    UPDATE player_stats
    SET minutes = ?, position = ?, rating = ?, 
        shots_total = ?, goals_total = ?, assists = ?, 
        passes_total = ?, tackles_total = ?
    WHERE player_id = ? AND fixture_id = ?
  `;

  const values = [
    stats.minutes || 0,
    stats.position || null,
    stats.rating || null,
    stats.shots_total || 0,
    stats.goals_total || 0,
    stats.assists || 0,
    stats.passes_total || 0,
    stats.tackles_total || 0,
    stats.player_id,
    stats.fixture_id,
  ];

  const [result] = await pool.query(sql, values);
  return result;
}

// ❌ Delete player stats
async function deletePlayerStats(player_id, fixture_id) {
  const sql = "DELETE FROM player_stats WHERE player_id = ? AND fixture_id = ?";
  const [result] = await pool.query(sql, [player_id, fixture_id]);
  return result;
}

module.exports = {
  insertPlayerStats,
  getPlayerStats,
  getAllPlayerStats,
  updatePlayerStats,
  deletePlayerStats,
};
