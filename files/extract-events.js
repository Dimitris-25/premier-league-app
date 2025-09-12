// files/extract-events.js
// Usage: node files/extract-events.js input.json output.csv

const fs = require("fs");
const path = require("path");

// Get CLI args
const [, , inputFile, outputFile] = process.argv;

if (!inputFile || !outputFile) {
  console.error("Usage: node files/extract-events.js input.json output.csv");
  process.exit(1);
}

// Read Newman/Collection run JSON
const raw = fs.readFileSync(path.resolve(inputFile), "utf-8");
const data = JSON.parse(raw);

// Newman stores executions under run.executions
const executions = data.run?.executions || [];

let rows = [];

// Loop through executions and extract needed info
executions.forEach((exec) => {
  const fixtureId =
    exec?.request?.url?.query?.find((q) => q.key === "fixture")?.value || "";
  const body = exec?.response?.stream
    ? exec.response.stream.toString()
    : exec.response?.body;

  try {
    const parsed = JSON.parse(body);

    // Each event inside response
    parsed.response?.forEach((ev) => {
      rows.push({
        fixture_id: fixtureId,
        time: ev.time?.elapsed || "",
        team: ev.team?.name || "",
        player: ev.player?.name || "",
        type: ev.type || "",
        detail: ev.detail || "",
      });
    });
  } catch (err) {
    console.warn(`Skipping fixture ${fixtureId}: cannot parse response`);
  }
});

// Build CSV
let csv = "fixture_id,time,team,player,type,detail\n";
rows.forEach((r) => {
  csv += `${r.fixture_id},${r.time},"${r.team}","${r.player}",${r.type},${r.detail}\n`;
});

// Write CSV
fs.writeFileSync(path.resolve(outputFile), csv, "utf-8");

console.log(`✅ Extracted ${rows.length} events into ${outputFile}`);
