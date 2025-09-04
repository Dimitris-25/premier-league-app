const fs = require("fs");
const path = require("path");
const { parse } = require("json2csv");
const csvParser = require("csv-parser");

async function filterCsvByIds() {
  try {
    // 1. Load Premier League IDs (CSV)
    const idsPath = path.join(__dirname, "../files/premierPlayerIds.csv");
    const idsRaw = fs.readFileSync(idsPath, "utf-8").split("\n");
    const ids = idsRaw
      .map((id) => id.trim())
      .filter((id) => id !== "")
      .map((id) => id.replace(/\r/g, "")); // καθάρισμα \r
    console.log("📌 Total IDs loaded:", ids.length);
    console.log("📌 First 10 IDs:", ids.slice(0, 10));

    // 2. Read profiles CSV
    const profilesPath = path.join(__dirname, "../files/playersProfilesAll.csv");
    let rows = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(profilesPath)
        .pipe(csvParser())
        .on("data", (row) => {
          // normalize το id σε string
          if (ids.includes(row.id.trim())) {
            rows.push(row);
          }
        })
        .on("end", resolve)
        .on("error", reject);
    });

    console.log("📌 Total profiles loaded:", rows.length);
    console.log("📌 First 3 profiles:", rows.slice(0, 3));

    // 3. Save filtered CSV
    const outPath = path.join(__dirname, "../files/playersProfilesPremier2025.csv");
    const csv = parse(rows, { fields: Object.keys(rows[0] || {}) });
    fs.writeFileSync(outPath, csv);

    console.log(`✅ Saved ${rows.length} Premier League profiles to ${outPath}`);
  } catch (err) {
    console.error("❌ Error filtering CSV:", err);
  }
}

filterCsvByIds();
