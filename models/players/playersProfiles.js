const pool = require("../../config/db");

// ➤ Δημιουργία / Εισαγωγή ή ενημέρωση παίκτη
async function insertPlayerProfile(player) {
  return pool.query(
    `INSERT INTO players_profiles 
      (player_id, firstname, lastname, age, birth_date, birth_place, birth_country,
       height, weight, number, position, photo, preferred_foot, market_value,
       injured, team_id, nationality_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       firstname = VALUES(firstname),
       lastname = VALUES(lastname),
       age = VALUES(age),
       birth_date = VALUES(birth_date),
       birth_place = VALUES(birth_place),
       birth_country = VALUES(birth_country),
       height = VALUES(height),
       weight = VALUES(weight),
       number = VALUES(number),
       position = VALUES(position),
       photo = VALUES(photo),
       preferred_foot = VALUES(preferred_foot),
       market_value = VALUES(market_value),
       injured = VALUES(injured),
       team_id = VALUES(team_id),
       nationality_id = VALUES(nationality_id)`,
    [
      player.player_id,
      player.firstname,
      player.lastname,
      player.age,
      player.birth_date,
      player.birth_place,
      player.birth_country,
      player.height,
      player.weight,
      player.number,
      player.position,
      player.photo,
      player.preferred_foot,
      player.market_value,
      player.injured,
      player.team_id,
      player.nationality_id
    ]
  );
}

// ➤ Διάβασμα ενός παίκτη
async function getPlayerProfile(player_id) {
  const sql = "SELECT * FROM players_profiles WHERE player_id = ?";
  const [rows] = await pool.query(sql, [player_id]);
  return rows[0];
}

// ➤ Διάβασμα όλων των παικτών
async function getAllPlayerProfiles() {
  const sql = "SELECT * FROM players_profiles";
  const [rows] = await pool.query(sql);
  return rows;
}

// ➤ Ενημέρωση παικτών με δυναμικά fields
async function updatePlayerProfile(player_id, updatedFields) {
  const fields = Object.keys(updatedFields)
    .map(field => `${field} = ?`)
    .join(", ");

  const values = Object.values(updatedFields);
  values.push(player_id);

  const sql = `UPDATE players_profiles SET ${fields} WHERE player_id = ?`;
  return pool.query(sql, values);
}

// ➤ Διαγραφή παίκτη
async function deletePlayerProfile(player_id) {
  const sql = "DELETE FROM players_profiles WHERE player_id = ?";
  return pool.query(sql, [player_id]);
}

module.exports = {
  insertPlayerProfile,
  getPlayerProfile,
  getAllPlayerProfiles,
  updatePlayerProfile,
  deletePlayerProfile
};
