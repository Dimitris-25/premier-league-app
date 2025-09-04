const fs = require("fs");
const path = require("path");

// 1. Load JSON file with IDs
const idsPath = path.join(__dirname, "../files/premierPlayerIds.json");
const rawData = fs.readFileSync(idsPath, "utf-8");
const ids = JSON.parse(rawData);

// 2. Convert to CSV format
let csv = "id\n"; // header
csv += ids.join("\n");

// 3. Save CSV file
const outPath = path.join(__dirname, "../files/premierPlayerIds.csv");
fs.writeFileSync(outPath, csv, "utf-8");

console.log(`✅ Saved ${ids.length} IDs to ${outPath}`);
