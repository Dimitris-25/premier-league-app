const pool = require("../../config/db");

async function insertTeam(team, venue) {
  if (!team?.id) {
    console.warn("⛔️ Team χωρίς id, skip:", team);
    return;
  }

  await pool.query(
    `INSERT INTO teams (team_id, name, code, country, founded, logo, venue_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE 
       name = VALUES(name),
       code = VALUES(code),
       country = VALUES(country),
       founded = VALUES(founded),
       logo = VALUES(logo),
       venue_id = VALUES(venue_id)`,
    [
      team.id,
      team.name || null,
      team.code || null,
      team.country || null,
      team.founded || null,
      team.logo || null,
      venue?.id || null
    ]
  );
}

async function getAllTeamsFromDB() {
  const [rows] = await pool.query("SELECT * FROM teams");
  return rows;
}

// 📌 Read by team_id
async function getTeamById(team_id) {
  const [rows] = await pool.query("SELECT * FROM teams WHERE team_id = ?", [team_id]);
  return rows[0];
}

// 📌 Update
async function updateTeam(team_id, team, venue) {
  await pool.query(
    `UPDATE teams 
     SET name = ?, code = ?, country = ?, founded = ?, logo = ?, venue_id = ?
     WHERE team_id = ?`,
    [
      team.name || null,
      team.code || null,
      team.country || null,
      team.founded || null,
      team.logo || null,
      venue?.id || null,
      team_id,
    ]
  );
}

// 📌 Delete
async function deleteTeam(team_id) {
  await pool.query("DELETE FROM teams WHERE team_id = ?", [team_id]);
}


module.exports = {
  insertTeam,
  getAllTeamsFromDB,
  getTeamById,
  updateTeam,
  deleteTeam,
};
