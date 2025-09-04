const fs = require("fs");
const path = require("path");

function filterPremierProfiles() {
  // 1. Read the JSON file
  const rawData = fs.readFileSync(
    path.join(__dirname, "../files/playersProfilesAll.json"),
    "utf-8"
  );
  const jsonData = JSON.parse(rawData);

  // Handle both array and object with response property
  const allPlayers = Array.isArray(jsonData) ? jsonData : jsonData.response;

  // 2. Filter only Premier League players for season 2025
  const premierPlayers = allPlayers.filter(
    (p) =>
      p.statistics &&
      p.statistics.some(
        (stat) => stat.league.id === 39 && stat.league.season === 2025
      )
  );

  console.log(
    `✅ Found ${premierPlayers.length} Premier League 2025 players`
  );

  // 3. Save filtered players into a new JSON file
  const filePath = path.join(
    __dirname,
    "../files/playersProfilesPremier2025.json"
  );
  fs.writeFileSync(
    filePath,
    JSON.stringify({ response: premierPlayers }, null, 2),
    "utf-8"
  );

  console.log(`💾 Saved to ${filePath}`);
}

filterPremierProfiles();
