const mysql = require("mysql2/promise");
const fs = require("fs");
require("dotenv").config();

const playersData = JSON.parse(
  fs.readFileSync("files/premierPlayerProfiles2025.json", "utf8")
);

async function insertPlayersProfiles() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  for (const item of playersData) {
    const p = item.player;

    try {
      await connection.execute(
        `INSERT INTO players_profiles (
          player_id, firstname, lastname, age, birth_date, birth_place, birth_country,
          height, weight, number, position, photo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          firstname=VALUES(firstname),
          lastname=VALUES(lastname),
          age=VALUES(age),
          birth_date=VALUES(birth_date),
          birth_place=VALUES(birth_place),
          birth_country=VALUES(birth_country),
          height=VALUES(height),
          weight=VALUES(weight),
          number=VALUES(number),
          position=VALUES(position),
          photo=VALUES(photo)`,
        [
          p.id,                // API field → DB column player_id
          p.firstname || null,
          p.lastname || null,
          p.age || null,
          p.birth?.date || null,
          p.birth?.place || null,
          p.birth?.country || null,
          p.height || null,
          p.weight || null,
          p.number || null,
          p.position || null,
          p.photo || null,
        ]
      );
    } catch (err) {
      console.error("❌ Error inserting player", p?.id, err.message);
    }
  }

  await connection.end();
  console.log("✅ Όλα τα player profiles περάσανε στον πίνακα players_profiles!");
}

insertPlayersProfiles();
