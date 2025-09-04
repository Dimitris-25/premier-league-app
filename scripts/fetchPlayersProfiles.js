const fs = require("fs");
const path = require("path");
const axios = require("axios");

require("dotenv").config();

const API_KEY = process.env.API_KEY; // βάλε στο .env το API key
const BASE_URL = "https://v3.football.api-sports.io";

async function fetchPremierPlayerIds() {
  const allIds = [];
  let page = 1;
  let more = true;

  console.log("📥 Fetching Premier League player IDs...");

  while (more) {
    const url = `${BASE_URL}/players?league=39&season=2025&page=${page}`;
    const res = await axios.get(url, {
      headers: { "x-apisports-key": API_KEY },
    });

    const players = res.data.response;
    if (players.length === 0) {
      more = false;
      break;
    }

    for (const p of players) {
      allIds.push(p.player.id);
    }

    console.log(`✅ Page ${page}: fetched ${players.length} players`);
    page++;
  }

  console.log(`📌 Total IDs collected: ${allIds.length}`);
  return allIds;
}

async function fetchProfiles(ids) {
  const profiles = [];

  console.log("📥 Fetching full player profiles...");

  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    try {
      const url = `${BASE_URL}/players/profiles?id=${id}`;
      const res = await axios.get(url, {
        headers: { "x-apisports-key": API_KEY },
      });

      if (res.data.response && res.data.response.length > 0) {
        profiles.push(res.data.response[0]);
      }

      console.log(`(${i + 1}/${ids.length}) Saved profile for player ${id}`);
      // 👉 Προσοχή στο rate limit (250/min). Αν θες βάζουμε μικρό delay:
      await new Promise((r) => setTimeout(r, 250)); // 0.25s delay = ~240 req/min
    } catch (err) {
      console.error(`❌ Error fetching profile for ${id}:`, err.message);
    }
  }

  return profiles;
}

async function main() {
  try {
    const ids = await fetchPremierPlayerIds();
    const profiles = await fetchProfiles(ids);

    const outPath = path.join(__dirname, "../files/premierProfiles2025.json");
    fs.writeFileSync(outPath, JSON.stringify(profiles, null, 2), "utf-8");

    console.log(`💾 Saved ${profiles.length} profiles to ${outPath}`);
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

main();

