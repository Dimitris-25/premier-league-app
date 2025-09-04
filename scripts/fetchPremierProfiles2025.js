const fs = require("fs");
const path = require("path");
const axios = require("axios");

require("dotenv").config();

const API_KEY = process.env.API_KEY;
const BASE_URL = "https://v3.football.api-sports.io";

async function fetchPremierProfiles() {
  const allProfiles = [];
  let page = 1;
  let more = true;

  console.log("📥 Fetching Premier League 2025 player profiles...");

  while (more) {
    try {
      const url = `${BASE_URL}/players?league=39&season=2025&page=${page}`;
      const res = await axios.get(url, {
        headers: { "x-apisports-key": API_KEY },
      });

      const players = res.data.response;
      if (!players || players.length === 0) {
        more = false;
        break;
      }

      allProfiles.push(...players);
      console.log(`✅ Page ${page}: fetched ${players.length} players`);

      page++;

      // για να μην φάμε rate limit
      await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      console.error(`❌ Error on page ${page}:`, err.message);
      more = false;
    }
  }

  console.log(`📌 Total profiles collected: ${allProfiles.length}`);

  const outPath = path.join(__dirname, "../files/premierProfiles2025.json");
  fs.writeFileSync(outPath, JSON.stringify(allProfiles, null, 2), "utf-8");

  console.log(`💾 Saved ${allProfiles.length} profiles to ${outPath}`);
}

fetchPremierProfiles();
