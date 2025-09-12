const fs = require("fs");
const path = require("path");
const readline = require("readline");

const IN_FILE =
  process.argv[2] ||
  "C:\\Users\\user\\Desktop\\premier-league-app\\files\\events\\2025.json";

// ΠΟΥ θα σωθούν τα αρχεία εξόδου
const OUT_DIR = "C:\\Users\\user\\Desktop\\NeoProject\\nodeFiles\\events";

// -------- helpers --------
function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function toCsv(rows) {
  const header = ["fixture_id", "team_id", "player_id", "type", "detail"];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.fixture_id ?? "",
        r.team_id ?? "",
        r.player_id ?? "",
        r.type ?? "",
        r.detail ?? "",
      ]
        .map((v) => String(v).replace(/"/g, '""'))
        .map((v) => (v.includes(",") ? `"${v}"` : v))
        .join(",")
    );
  }
  return lines.join("\r\n");
}

function extractFromFixture(fxObj) {
  // Δομή API-Football: { parameters:{fixture:"1208..."}, response:[{...event...}, ...] }
  const fixtureId =
    fxObj?.parameters?.fixture ??
    fxObj?.fixture?.id ?? // σε περίπτωση που έχει άλλη μορφή
    null;

  const events = Array.isArray(fxObj?.response) ? fxObj.response : [];
  const out = [];
  for (const ev of events) {
    if (
      ev?.type === "Card" &&
      (ev?.detail === "Yellow Card" || ev?.detail === "Red Card")
    ) {
      out.push({
        fixture_id: fixtureId,
        team_id: ev?.team?.id ?? null,
        player_id: ev?.player?.id ?? null,
        type: ev?.type ?? null,
        detail: ev?.detail ?? null,
      });
    }
  }
  return out;
}

// ----------- FIX εδώ ---------
async function readFixturesAnyFormat(filePath) {
  const rawText = fs.readFileSync(filePath, "utf8").trim();

  // Περίπτωση 1: απλό array [ {...}, {...} ]
  if (rawText.startsWith("[")) {
    const raw = JSON.parse(rawText);
    if (Array.isArray(raw)) return raw;
    return raw?.fixtures ?? [];
  }

  // Περίπτωση 2: απλό object { response: [...] }
  const parsed = JSON.parse(rawText);
  if (Array.isArray(parsed.response)) return parsed.response;

  // Περίπτωση 3: API dump με results[0].response.body (stringified JSON)
  const bodyStr = parsed?.results?.[0]?.response?.body;
  if (typeof bodyStr === "string") {
    const inner = JSON.parse(bodyStr);
    if (Array.isArray(inner.response)) return [inner]; // Επιστρέφουμε ένα fixture
  }

  // Περίπτωση 4: NDJSON (μία εγγραφή ανά γραμμή)
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath, { encoding: "utf8" }),
    crlfDelay: Infinity,
  });

  const fixtures = [];
  for await (const line of rl) {
    const s = line.trim();
    if (!s) continue;
    try {
      fixtures.push(JSON.parse(s));
    } catch {
      // αγνόησε γραμμές που δεν είναι έγκυρο JSON
    }
  }
  return fixtures;
}
// -----------------------------

async function main() {
  const input = path.resolve(IN_FILE);
  if (!fs.existsSync(input)) {
    console.error("✖ Δεν βρέθηκε το αρχείο εισόδου:", input);
    process.exit(1);
  }

  console.log("Διαβάζω fixtures από:", input);
  const fixtures = await readFixturesAnyFormat(input);
  console.log("Fixtures φορτωμένα:", fixtures.length);

  // Εξαγωγή triplets (μόνο κάρτες)
  const rows = [];
  for (const fx of fixtures) {
    rows.push(...extractFromFixture(fx));
  }

  // Προσδιορισμός year από το filename (π.χ. 2025.json)
  const base = path.basename(input);
  const m = base.match(/(\d{4})/);
  const year = m ? m[1] : "year";

  ensureDir(OUT_DIR);
  const outCsvPath = path.join(OUT_DIR, `cards_triplets_${year}.csv`);
  const outJsonPath = path.join(OUT_DIR, `cards_triplets_${year}.json`);

  fs.writeFileSync(outCsvPath, toCsv(rows), "utf8");
  fs.writeFileSync(outJsonPath, JSON.stringify(rows, null, 2), "utf8");

  console.log(`OK. Βρέθηκαν ${rows.length} events με κάρτες.`);
  console.log("CSV :", outCsvPath);
  console.log("JSON:", outJsonPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
