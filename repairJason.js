// repairJson.js
const fs = require("fs");
const { jsonrepair } = require("jsonrepair");

const filePath = process.argv[2];

if (!filePath) {
  console.error("❌ Please provide a JSON file path.");
  process.exit(1);
}

try {
  const raw = fs.readFileSync(filePath, "utf-8");
  const repaired = jsonrepair(raw);

  fs.writeFileSync(filePath, repaired, "utf-8");

  console.log(`✅ File repaired successfully: ${filePath}`);
} catch (err) {
  console.error("❌ Failed to repair JSON:", err.message);
}
