// src/services/fixturesHeadToHead/h2h.class.js
// Feathers + Knex service for importing H2H fixtures from a local JSON file.

const fs = require("fs");
const path = require("path");

class FixturesHeadToHeadService {
  constructor(options) {
    this.options = options;
    this.Model = options.Model; // knex instance
    this.table = options.name; // "fixturesHeadToHead"
    this.id = options.id || "h2h_id"; // PK column
  }

  //  Standard CRUD
  async find(params) {
    return this.Model(this.table).select("*");
  }

  async get(id, params) {
    return this.Model(this.table).where(this.id, id).first();
  }

  async create(data, params) {
    const [inserted] = await this.Model(this.table).insert(data);
    return { ...data, [this.id]: inserted };
  }

  async patch(id, data, params) {
    await this.Model(this.table).where(this.id, id).update(data);
    return this.get(id);
  }

  async remove(id, params) {
    await this.Model(this.table).where(this.id, id).del();
    return { id };
  }

  // ---------- Custom: Import H2H from local file ----------
  /**
   * Import H2H fixtures from a local JSON file produced from API-Football.
   * The file structure (based on your screenshots) is:
   * {
   *   "results": [
   *     { "id": "33-34:2019", "response": { "body": "<stringified API JSON>" } },
   *     ...
   *   ]
   * }
   *
   * @param {string} fileRelPath Relative path from project root (default: files/teams/H2H.json)
   * @returns {object} summary { pairs, fixturesTotal, created, updated }
   */
  async importFromFile(fileRelPath = path.join("files", "teams", "H2H.json")) {
    // Resolve file path against project root to avoid cwd surprises
    const filePath = path.isAbsolute(fileRelPath)
      ? fileRelPath
      : path.join(process.cwd(), fileRelPath);

    if (!fs.existsSync(filePath)) {
      throw new Error(`H2H file not found: ${filePath}`);
    }

    // Read and parse outer JSON
    const raw = fs.readFileSync(filePath, "utf8");
    const root = JSON.parse(raw);
    const results = Array.isArray(root?.results) ? root.results : [];

    let fixturesTotal = 0;
    let created = 0;
    let updated = 0;

    // Use a single transaction for consistency/perf
    await this.Model.transaction(async (trx) => {
      for (const item of results) {
        // The "body" field is a STRING containing the API-Football JSON → parse again
        const bodyStr = item?.response?.body;
        if (!bodyStr || typeof bodyStr !== "string") continue;

        let apiPayload;
        try {
          apiPayload = JSON.parse(bodyStr);
        } catch (e) {
          // Skip malformed payloads but keep going
          // (You can log to a file if you prefer)
          continue;
        }

        const rows = Array.isArray(apiPayload?.response)
          ? apiPayload.response
          : [];
        fixturesTotal += rows.length;

        for (const r of rows) {
          //  Extract pieces from API response
          const f = r.fixture || {};
          const l = r.league || {};
          const t = r.teams || {};
          const g = r.goals || {};
          const s = r.score || {};

          // Resolve FK: leagues (by api_league_id)
          let leagueId = null;
          if (Number.isInteger(l.id)) {
            const league = await trx("leagues")
              .where({ api_league_id: l.id })
              .first();
            if (league) leagueId = league.league_id;
          }

          // Resolve FK: venue (by api_venue_id if present)
          let venueId = null;
          if (Number.isInteger(f?.venue?.id)) {
            const venue = await trx("venues")
              .where({ api_venue_id: f.venue.id })
              .first();
            if (venue) venueId = venue.venue_id;
          }

          // Resolve FKs: teamsInfo (by api_team_id)
          let homeTeamId = null;
          let awayTeamId = null;
          if (Number.isInteger(t?.home?.id)) {
            const home = await trx("teamsInfo")
              .where({ api_team_id: t.home.id })
              .first();
            if (home) homeTeamId = home.team_id;
          }
          if (Number.isInteger(t?.away?.id)) {
            const away = await trx("teamsInfo")
              .where({ api_team_id: t.away.id })
              .first();
            if (away) awayTeamId = away.team_id;
          }

          // Build record per your migration columns
          const record = {
            api_fixture_id: f.id, // UNIQUE
            league_id: leagueId,
            season: this.#toInt(l.season),
            round: l.round ?? null,

            date_utc: this.#toMySQLDateTime(f.date),
            timestamp: this.#toInt(f.timestamp),
            timezone: f.timezone ?? null,
            referee: f.referee ?? null,
            status_short: f?.status?.short ?? null,
            status_long: f?.status?.long ?? null,
            elapsed: this.#toInt(f?.status?.elapsed),
            status_extra: this.#toInt(f?.status?.extra),

            venue_id: venueId,
            venue_name: f?.venue?.name ?? null,
            venue_city: f?.venue?.city ?? null,

            home_team_id: homeTeamId,
            away_team_id: awayTeamId,

            goals_home: this.#toInt(g?.home),
            goals_away: this.#toInt(g?.away),

            ht_home: this.#toInt(s?.halftime?.home),
            ht_away: this.#toInt(s?.halftime?.away),
            ft_home: this.#toInt(s?.fulltime?.home),
            ft_away: this.#toInt(s?.fulltime?.away),
            et_home: this.#toInt(s?.extratime?.home),
            et_away: this.#toInt(s?.extratime?.away),
            pen_home: this.#toInt(s?.penalty?.home),
            pen_away: this.#toInt(s?.penalty?.away),

            home_winner: this.#toBool(t?.home?.winner),
            away_winner: this.#toBool(t?.away?.winner),
          };

          // Skip if vital fields are missing (api_fixture_id + teams)
          if (
            !record.api_fixture_id ||
            !record.home_team_id ||
            !record.away_team_id
          ) {
            continue;
          }

          //  Upsert by api_fixture_id (manual, MySQL-safe)
          const existing = await trx(this.table)
            .where({ api_fixture_id: record.api_fixture_id })
            .first();

          if (existing) {
            await trx(this.table)
              .where({ h2h_id: existing.h2h_id })
              .update(record);
            updated++;
          } else {
            await trx(this.table).insert(record);
            created++;
          }
        }
      }
    });

    return {
      pairs: results.length,
      fixturesTotal,
      created,
      updated,
    };
  }

  //  Helpers
  #toInt(v) {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : null;
  }

  /**
   * Convert ISO date to "YYYY-MM-DD HH:MM:SS" (UTC) for MySQL DATETIME.
   * If value is falsy or invalid, returns null.
   */
  #toMySQLDateTime(iso) {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;

    const pad = (x) => String(x).padStart(2, "0");
    return (
      d.getUTCFullYear() +
      "-" +
      pad(d.getUTCMonth() + 1) +
      "-" +
      pad(d.getUTCDate()) +
      " " +
      pad(d.getUTCHours()) +
      ":" +
      pad(d.getUTCMinutes()) +
      ":" +
      pad(d.getUTCSeconds())
    );
  }

  #toBool(v) {
    if (v === true) return 1;
    if (v === false) return 0;
    return null;
  }
}

module.exports = { FixturesHeadToHeadService };
