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

module.exports = { insertTeam, getAllTeamsFromDB };
