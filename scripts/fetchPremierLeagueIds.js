const fs = require("fs");
const path = require("path");
const axios = require("axios");
require("dotenv").config();

async function fetchPremierLeagueIds() {
  try {
    let page = 1;
    let allIds = [];
    let totalPages = 1;

    while (page <= totalPages) {
      console.log(`📄 Fetching page ${page}...`);

      const response = await axios.get("https://v3.football.api-sports.io/players", {
        params: {
          league: 39,   // Premier League
          season: 2025  // Season 2025
        },
        headers: {
          "x-apisports-key": process.env.API_KEY
        }
      });

      const data = response.data;
      totalPages = data.paging.total;

      const ids = data.response.map(p => p.player.id);
      allIds.push(...ids);

      console.log(`✅ Page ${page}/${totalPages} - Collected ${ids.length} IDs`);

      page++;
    }

    const filePath = path.join(__dirname, "../files/premierPlayerIds.json");
    fs.writeFileSync(filePath, JSON.stringify(allIds, null, 2), "utf-8");

    console.log(`🎉 Saved ${allIds.length} player IDs to ${filePath}`);
  } catch (err) {
    console.error("❌ Error fetching Premier League player IDs:", err.message);
  }
}

fetchPremierLeagueIds();
