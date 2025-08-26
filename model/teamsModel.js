const axios = require("axios");
const pool = require("../db"); // σύνδεση MySQL

const API_KEY = process.env.FOOTBALL_API_KEY;


async function fetchAndSaveTeams() {
  try {
    // 1. Τραβάμε δεδομένα από API-Football
    const response = await axios.get("https://v3.football.api-sports.io/teams", {
      params: { league: 39, season: 2025 }, // Premier League 2023/24
      headers: { "x-apisports-key": API_KEY }
    });

    const teams = response.data.response;

    // 2. Βάζουμε κάθε ομάδα στη MySQL
    for (let item of teams) {
      const team = item.team;
      const venue = item.venue;

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

    console.log("✅ Teams saved to DB!");
  } catch (err) {
    console.error("❌ Error fetching teams:", err.message);
  }
}

module.exports = { fetchAndSaveTeams };

fetchAndSaveTeams();


