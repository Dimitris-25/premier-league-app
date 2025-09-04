const fs = require("fs");
const path = require("path");
const { parse } = require("json2csv");

// 1. Read the big JSON file
const rawData = fs.readFileSync(path.join(__dirname, "../files/playersProfilesAll.json"), "utf-8");
const players = JSON.parse(rawData);

// 2. Extract fields
const rows = players.map(p => {
  const pl = p.player;
  return {
    id: pl.id,
    firstname: pl.firstname,
    lastname: pl.lastname,
    age: pl.age,
    nationality: pl.nationality,
    position: pl.position,
    team: p.statistics?.[0]?.team?.name || null
  };
});

// 3. Convert to CSV
const csv = parse(rows, { fields: ["id", "firstname", "lastname", "age", "nationality", "position", "team"] });

// 4. Save CSV
const outPath = path.join(__dirname, "../files/playersProfilesAll.csv");
fs.writeFileSync(outPath, csv);

console.log(`✅ Exported to ${outPath}`);
