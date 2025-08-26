const axios = require("axios");
const fs = require("fs");

require("dotenv").config();

const API_KEY = process.env.FOOTBALL_API_KEY;

async function fetchTeams() {
  try {
    const response = await axios.get("https://v3.football.api-sports.io/teams", {
      params: { league: 39, season: 2023 }, // Premier League 2023/24
      headers: { "x-apisports-key": API_KEY }
    });

    const data = response.data;

    // Αποθήκευση σε JSON για έλεγχο
    fs.writeFileSync("teams.json", JSON.stringify(data, null, 2));
    console.log("✅ Data saved to teams.json");
  } catch (err) {
    console.error("❌ Error fetching data:", err.message);
  }
}

fetchTeams();
