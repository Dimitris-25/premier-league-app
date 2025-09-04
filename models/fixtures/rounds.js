const pool = require("../../config/db");

// ➕ Insert ή Update Round
async function insertRound(round) {
  const sql = `
    INSERT INTO rounds (
      league_id, season_id, round
    ) VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE
      round = VALUES(round)
  `;

  const values = [
    round.league_id,
    round.season_id,
    round.round
  ];

  await pool.query(sql, values);
}

// 📖 Fetch Round by ID
async function fetchRoundById(round_id) {
  const sql = "SELECT * FROM rounds WHERE round_id = ?";
  const [rows] = await pool.query(sql, [round_id]);
  return rows[0];
}

// 📖 Fetch all Rounds
async function fetchAllRounds() {
  const sql = "SELECT * FROM rounds";
  const [rows] = await pool.query(sql);
  return rows;
}

// ✏️ Update Round
async function updateRound(round) {
  const sql = `
    UPDATE rounds
    SET league_id = ?, season_id = ?, round = ?
    WHERE round_id = ?
  `;

  const values = [
    round.league_id,
    round.season_id,
    round.round,
    round.round_id
  ];

  const [result] = await pool.query(sql, values);
  return result;
}

// ❌ Delete Round
async function deleteRound(round_id) {
  const sql = "DELETE FROM rounds WHERE round_id = ?";
  const [result] = await pool.query(sql, [round_id]);
  return result;
}

module.exports = {
  insertRound,
  fetchRoundById,
  fetchAllRounds,
  updateRound,
  deleteRound,
};
