// models/players/players.js
const pool = require("../../config/db");

// ➕ Create or update a player
async function insertPlayer(player) {
  const sql = `
    INSERT INTO players 
      (player_id, firstname, lastname, age, birth_date, height, weight, injured, photo, team_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      firstname = VALUES(firstname),
      lastname = VALUES(lastname),
      age = VALUES(age),
      birth_date = VALUES(birth_date),
      height = VALUES(height),
      weight = VALUES(weight),
      injured = VALUES(injured),
      photo = VALUES(photo),
      team_id = VALUES(team_id)
  `;

  const values = [
    player.player_id,
    player.firstname,
    player.lastname,
    player.age,
    player.birth_date,
    player.height,
    player.weight,
    player.injured,
    player.photo,
    player.team_id,
  ];

  await pool.query(sql, values);
}

// 📖 Read all players
async function getAllPlayers() {
  const sql = "SELECT * FROM players";
  const [rows] = await pool.query(sql);
  return rows;
}

// 📖 Read one player by ID
async function getPlayerById(id) {
  const sql = "SELECT * FROM players WHERE player_id = ?";
  const [rows] = await pool.query(sql, [id]);
  return rows[0];
}

// ✏️ Update player
async function updatePlayer(id, updates) {
  const sql = `
    UPDATE players SET 
      firstname = ?, lastname = ?, age = ?, birth_date = ?, 
      height = ?, weight = ?, injured = ?, photo = ?, team_id = ?
    WHERE player_id = ?
  `;

  const values = [
    updates.firstname,
    updates.lastname,
    updates.age,
    updates.birth_date,
    updates.height,
    updates.weight,
    updates.injured,
    updates.photo,
    updates.team_id,
    id,
  ];

  await pool.query(sql, values);
}

// 🗑️ Delete player
async function deletePlayer(id) {
  const sql = "DELETE FROM players WHERE player_id = ?";
  await pool.query(sql, [id]);
}

module.exports = {
  insertPlayer,
  getAllPlayers,
  getPlayerById,
  updatePlayer,
  deletePlayer,
};
