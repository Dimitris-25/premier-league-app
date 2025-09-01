const pool = require("../db");

async function insertTeam(team, venue) {
  await pool.query(
    `INSERT INTO teams (id, name, code, country, founded, stadium, city, capacity, logo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE 
       name = VALUES(name),
       code = VALUES(code),
       country = VALUES(country),
       founded = VALUES(founded),
       stadium = VALUES(stadium),
       city = VALUES(city),
       capacity = VALUES(capacity),
       logo = VALUES(logo)`,
    [
      team.id,
      team.name,
      team.code,
      team.country,
      team.founded,
      venue.name,
      venue.city,
      venue.capacity,
      team.logo
    ]
  );
}

module.exports = { insertTeam };
