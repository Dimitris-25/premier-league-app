const pool = require("../../config/db");

// ➕ Insert ή Update player στο squad
async function insertSquadPlayer(player) {
  const sql = `
    INSERT INTO squads (
      team_id, player_id, name, age, number, position, photo
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      age = VALUES(age),
      number = VALUES(number),
      position = VALUES(position),
      photo = VALUES(photo)
  `;

  const values = [
    player.team_id,
    player.player_id,
    player.name,
    player.age || null,
    player.number || null,
    player.position || null,
    player.photo || null,
  ];

  await pool.query(sql, values);
}

// 📖 Fetch squad μιας ομάδας
async function fetchSquadByTeam(team_id) {
  const sql = "SELECT * FROM squads WHERE team_id = ?";
  const [rows] = await pool.query(sql, [team_id]);
  return rows;
}

// 📖 Fetch όλα τα squads
async function fetchAllSquads() {
  const sql = "SELECT * FROM squads";
  const [rows] = await pool.query(sql);
  return rows;
}

// ✏️ Update player σε squad
async function updateSquadPlayer(player) {
  const sql = `
    UPDATE squads
    SET name = ?, age = ?, number = ?, position = ?, photo = ?
    WHERE team_id = ? AND player_id = ?
  `;

  const values = [
    player.name,
    player.age || null,
    player.number || null,
    player.position || null,
    player.photo || null,
    player.team_id,
    player.player_id,
  ];

  const [result] = await pool.query(sql, values);
  return result;
}

// ❌ Delete player από squad
async function deleteSquadPlayer(team_id, player_id) {
  const sql = "DELETE FROM squads WHERE team_id = ? AND player_id = ?";
  const [result] = await pool.query(sql, [team_id, player_id]);
  return result;
}

module.exports = {
  insertSquadPlayer,
  fetchSquadByTeam,
  fetchAllSquads,
  updateSquadPlayer,
  deleteSquadPlayer,
};
