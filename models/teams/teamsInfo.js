const pool = require("../../config/db");

async function insertTeam(team, venue) {
  if (!team?.id) {
    console.warn("⛔️ Team χωρίς id, skip:", team);
    return;
  }

  const sql = `
    INSERT INTO teams (team_id, name, code, country, founded, logo, venue_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
      name = VALUES(name),
      code = VALUES(code),
      country = VALUES(country),
      founded = VALUES(founded),
      logo = VALUES(logo),
      venue_id = VALUES(venue_id)
  `;

  const values = [
    team.id,
    team.name || null,
    team.code || null,
    team.country || null,
    team.founded || null,
    team.logo || null,
    venue?.id || null,
  ];

  await pool.query(sql, values);
}

async function getAllTeamsFromDB() {
  const sql = "SELECT * FROM teams";
  const [rows] = await pool.query(sql);
  return rows;
}

// 📌 Read by team_id
async function getTeamById(team_id) {
  const sql = "SELECT * FROM teams WHERE team_id = ?";
  const [rows] = await pool.query(sql, [team_id]);
  return rows[0];
}

// 📌 Update
async function updateTeam(team_id, team, venue) {
  const sql = `
    UPDATE teams 
    SET name = ?, code = ?, country = ?, founded = ?, logo = ?, venue_id = ?
    WHERE team_id = ?
  `;

  const values = [
    team.name || null,
    team.code || null,
    team.country || null,
    team.founded || null,
    team.logo || null,
    venue?.id || null,
    team_id,
  ];

  await pool.query(sql, values);
}

// 📌 Delete
async function deleteTeam(team_id) {
  const sql = "DELETE FROM teams WHERE team_id = ?";
  await pool.query(sql, [team_id]);
}

module.exports = {
  insertTeam,
  getAllTeamsFromDB,
  getTeamById,
  updateTeam,
  deleteTeam,
};
