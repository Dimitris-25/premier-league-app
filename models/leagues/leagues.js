// models/leagues/leagues.js
const pool = require("../../config/db");

// ➕ Insert or update league
async function insertLeague(league) {
  const sql = `
    INSERT INTO leagues (league_id, name, country, code, logo, flag)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      country = VALUES(country),
      code = VALUES(code),
      logo = VALUES(logo),
      flag = VALUES(flag)
  `;
  const values = [
    league.league_id,
    league.name,
    league.country,
    league.code,
    league.logo,
    league.flag,
  ];
  await pool.query(sql, values);
}

// 📖 Get all leagues
async function getAllLeagues() {
  const [rows] = await pool.query("SELECT * FROM leagues");
  return rows;
}

// 📖 Get league by ID
async function getLeagueById(id) {
  const [rows] = await pool.query("SELECT * FROM leagues WHERE league_id = ?", [
    id,
  ]);
  return rows[0];
}

// ✏️ Update league
async function updateLeague(id, updates) {
  const fields = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(", ");
  const values = Object.values(updates);
  values.push(id);

  const sql = `UPDATE leagues SET ${fields} WHERE league_id = ?`;
  await pool.query(sql, values);
}

// 🗑️ Delete league
async function deleteLeague(id) {
  await pool.query("DELETE FROM leagues WHERE league_id = ?", [id]);
}

module.exports = {
  insertLeague,
  getAllLeagues,
  getLeagueById,
  updateLeague,
  deleteLeague,
};
