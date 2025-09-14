// src/services/fixtures/fixtures.class.js
// Importer/CRUD for fixtures — works with BOTH nested API shape and our flat results_2025.json

const fs = require("fs");
const path = require("path");

class Fixtures {
  constructor(options) {
    this.options = options;
    this.Model = options.Model; // knex instance
    this.table = options.name; // "fixtures"
  }

  // ---------- CRUD ----------
  async find(params) {
    return this.Model(this.table).select("*");
  }
  async get(id, params) {
    return this.Model(this.table).where("fixture_id", id).first();
  }
  async create(data, params) {
    const [id] = await this.Model(this.table).insert(data);
    return { ...data, fixture_id: id };
  }
  async patch(id, data, params) {
    await this.Model(this.table).where("fixture_id", id).update(data);
    return this.get(id);
  }
  async remove(id, params) {
    await this.Model(this.table).where("fixture_id", id).del();
    return { id };
  }

  // Helpers
  // get first existing path value (supports "a.b.c" keys)
  #pick(obj, ...keys) {
    for (const k of keys) {
      const v = k
        .split(".")
        .reduce((o, p) => (o && o[p] !== undefined ? o[p] : undefined), obj);
      if (v !== undefined && v !== null) return v;
    }
    return undefined;
  }
  #toInt(v) {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  #parseScorePair(s) {
    if (!s || typeof s !== "string" || !s.includes("-")) return [null, null];
    const [a, b] = s
      .split("-")
      .map((x) => (String(x).trim() === "null" ? null : Number(x)));
    return [Number.isFinite(a) ? a : null, Number.isFinite(b) ? b : null];
  }

  // Import from local file
  async fetchFromApi() {
    // 1) Read file (JSON array). If JSON parsing fails, try .js module (module.exports = [...])
    const filePath = path.join(
      process.cwd(),
      "files",
      "fixtures",
      "results_2025.json"
    );
    let items;
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      items = JSON.parse(raw);
    } catch (_) {
      const jsPath = path.join(
        process.cwd(),
        "files",
        "fixtures",
        "results_2025.js"
      );
      // eslint-disable-next-line import/no-dynamic-require, global-require
      items = require(jsPath);
    }
    if (!Array.isArray(items)) throw new Error("results_2025 is not an array");

    // 2) Build FK maps
    const leagues = await this.Model("leagues").select(
      "league_id",
      "api_league_id"
    );
    const leagueMap = new Map(
      leagues.map((l) => [Number(l.api_league_id), l.league_id])
    );

    const teams = await this.Model("teamsInfo").select(
      "team_id",
      "api_team_id"
    );
    const teamMap = new Map(
      teams.map((t) => [Number(t.api_team_id), t.team_id])
    );

    let venueMap = new Map();
    const hasVenues = await this.Model.schema.hasTable("venues");
    if (hasVenues) {
      const venues = await this.Model("venues").select(
        "venue_id",
        "api_venue_id"
      );
      venueMap = new Map(
        venues.map((v) => [Number(v.api_venue_id), v.venue_id])
      );
    }

    // 3) Upsert
    let created = 0,
      updated = 0,
      skipped = 0;
    const reasons = { noTeams: 0, noLeague: 0, invalidDate: 0 };

    for (const it of items) {
      // ids
      const api_fixture_id = this.#toInt(
        this.#pick(it, "fixture.id", "fixture_id")
      );
      if (!api_fixture_id) {
        skipped++;
        continue;
      }

      const api_league_id = this.#toInt(
        this.#pick(it, "league.id", "league_id")
      );
      const league_id =
        leagueMap.get(api_league_id) || leagueMap.get(39) || null;
      if (!league_id) {
        skipped++;
        reasons.noLeague++;
        continue;
      }

      // teams
      const apiHome = this.#toInt(
        this.#pick(it, "teams.home.id", "home_team_id")
      );
      const apiAway = this.#toInt(
        this.#pick(it, "teams.away.id", "away_team_id")
      );
      const home_team_id = apiHome ? teamMap.get(apiHome) || null : null;
      const away_team_id = apiAway ? teamMap.get(apiAway) || null : null;
      if (!home_team_id || !away_team_id) {
        skipped++;
        reasons.noTeams++;
        continue;
      }

      // venue
      const api_venue_id = this.#toInt(
        this.#pick(it, "fixture.venue.id", "venue_id")
      );
      const venue_id = api_venue_id ? venueMap.get(api_venue_id) || null : null;

      // date
      const dateStr = this.#pick(it, "fixture.date", "date");
      const date_utc = dateStr ? new Date(dateStr) : null;
      if (!(date_utc instanceof Date) || Number.isNaN(date_utc.getTime())) {
        skipped++;
        reasons.invalidDate++;
        continue;
      }

      const timestamp = this.#toInt(
        this.#pick(it, "fixture.timestamp", "timestamp")
      );
      const timezone = this.#pick(it, "fixture.timezone", "timezone") || "UTC";

      // status
      const status_short =
        this.#pick(it, "fixture.status.short", "status_short") || null;
      const status_long =
        this.#pick(it, "fixture.status.long", "status_long") || null;
      const elapsed = this.#toInt(
        this.#pick(it, "fixture.status.elapsed", "elapsed")
      );
      const stoppage_extra = this.#toInt(
        this.#pick(it, "fixture.status.extra", "stoppage_extra")
      );

      // scores (accept nested or flat "a-b")
      const goals_home = this.#toInt(
        this.#pick(it, "goals.home", "goals_home")
      );
      const goals_away = this.#toInt(
        this.#pick(it, "goals.away", "goals_away")
      );

      const [ht_home, ht_away] = this.#parseScorePair(
        this.#pick(it, "score.halftime", "score_ht")
      );
      const [ft_home, ft_away] = this.#parseScorePair(
        this.#pick(it, "score.fulltime", "score_ft")
      );
      const [et_home, et_away] = this.#parseScorePair(
        this.#pick(it, "score.extratime", "score_et")
      );
      const [pen_home, pen_away] = this.#parseScorePair(
        this.#pick(it, "score.penalty", "score_pk")
      );

      // season & round
      const season =
        this.#toInt(this.#pick(it, "league.season", "season")) || 2025;
      const round = this.#pick(it, "league.round", "round") || null;

      // winner — accept flat 'home/away/draw' or nested booleans, fallback from goals
      let winner = this.#pick(it, "winner") || null;
      if (!winner) {
        const homeWin = this.#pick(it, "teams.home.winner");
        const awayWin = this.#pick(it, "teams.away.winner");
        winner = homeWin === true ? "home" : awayWin === true ? "away" : null;
        if (
          !winner &&
          Number.isFinite(goals_home) &&
          Number.isFinite(goals_away)
        ) {
          winner =
            goals_home > goals_away
              ? "home"
              : goals_home < goals_away
                ? "away"
                : "draw";
        }
      }

      const row = {
        api_fixture_id,
        league_id,
        venue_id,
        date_utc,
        timestamp,
        home_team_id,
        away_team_id,
        goals_home,
        goals_away,
        ht_home,
        ht_away,
        ft_home,
        ft_away,
        et_home,
        et_away,
        pen_home,
        pen_away,
        status_short,
        status_long,
        elapsed,
        stoppage_extra,
        round,
        season,
        winner,
        timezone,
      };

      const existing = await this.Model(this.table)
        .where({ api_fixture_id })
        .first();
      if (existing) {
        await this.Model(this.table).where({ api_fixture_id }).update(row);
        updated++;
      } else {
        await this.Model(this.table).insert(row);
        created++;
      }
    }

    return {
      ok: true,
      source: filePath,
      total: items.length,
      created,
      updated,
      skipped,
      reasons,
    };
  }
}

module.exports = { Fixtures };
