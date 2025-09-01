const pool = require("../../config/db");

async function insertVenue(venue) {
  if (!venue?.id) {
    console.warn("⛔ Venue χωρίς id, skip:", venue);
    return;
  }

  await pool.query(
    `INSERT INTO venues (venue_id, name, city, capacity)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE 
       name = VALUES(name),
       city = VALUES(city),
       capacity = VALUES(capacity)`,
    [
      venue.id,
      venue.name || null,
      venue.city || null,
      venue.capacity || null
    ]
  );
}

module.exports = { insertVenue };

