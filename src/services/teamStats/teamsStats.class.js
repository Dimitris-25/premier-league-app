// File-based importer for team season statistics (API-Football /teams/statistics)
// Reads either a directory of per-team JSON files OR one consolidated JSON,
// maps API IDs to DB FKs, and upserts into team_stats (unique by team_id+league_id+season).

"use strict";

const fs = require("fs");
const path = require("path");

const toInt = (v) =>
  v === null || v === undefined || v === ""
    ? null
    : Number.isFinite(+v)
      ? +v
      : null;
const nz = (v) => (Number.isFinite(+v) ? +v : 0);
const toFloat = (v) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
};
const pct = (s) => {
  if (s === null || s === undefined) return null;
  const n = parseFloat(String(s).replace("%", "").trim());
  return Number.isFinite(n) ? n : null;
};

class TeamsStatsService {
  constructor(options) {
    this.options = options || {};
    this.Model = this.options.Model;

    // DB tables (lowercase to match your schema)
    this.table = this.options.name || "team_stats";
    this.id = this.options.id || "stats_id";
    this.teamsTable = this.options.teamsTable || "teamsinfo";
    this.leaguesTable = this.options.leaguesTable || "leagues";

    // Inputs
    this.dir =
      this.options.dir ||
      path.resolve(process.cwd(), "files", "teams", "stats", "2025");
    this.file = this.options.file || null; // optional consolidated JSON

    // Fallbacks if files miss params
    this.defaultLeague = this.options.defaultLeague ?? null; // api league id
    this.defaultSeason = this.options.defaultSeason ?? null; // season year
  }

  // ---------- CRUD ----------
  async find() {
    return this.Model(this.table).select("*");
  }
  async get(id) {
    return this.Model(this.table).where(this.id, id).first();
  }
  async create(data) {
    const [pk] = await this.Model(this.table).insert(data);
    return { ...data, [this.id]: pk };
  }
  async patch(id, data) {
    await this.Model(this.table).where(this.id, id).update(data);
    return this.get(id);
  }
  async remove(id) {
    await this.Model(this.table).where(this.id, id).del();
    return { id };
  }

  // FK lookups
  async getTeamIdByApi(api_team_id) {
    if (!api_team_id) return null;
    const r = await this.Model(this.teamsTable)
      .select("team_id")
      .where("api_team_id", api_team_id)
      .first();
    return r?.team_id ?? null;
  }
  async getLeagueIdByApi(api_league_id) {
    if (!api_league_id) return null;
    const r = await this.Model(this.leaguesTable)
      .select("league_id")
      .where("api_league_id", api_league_id)
      .first();
    return r?.league_id ?? null;
  }

  //  Row builder
  buildRow({ league_id, team_id, season, payload }) {
    const res = payload || {};
    const fixtures = res.fixtures || {};
    const played = fixtures.played || {};
    const wins = fixtures.wins || {};
    const draws = fixtures.draws || {};
    const loses = fixtures.loses || {};

    const goals = res.goals || {};
    const gfTotal = goals.for?.total || {};
    const gaTotal = goals.against?.total || {};
    const gfAvg = goals.for?.average || {};
    const gaAvg = goals.against?.average || {};

    const clean = res.clean_sheet || {};
    const fts = res.failed_to_score || {};
    const pen = res.penalty || {};
    const biggest = res.biggest || {};
    const bStreak = biggest.streak || {};
    const bWins = biggest.wins || {};
    const bLoses = biggest.loses || {};
    const bGoals = biggest.goals || {};
    const bFor = bGoals.for || {};
    const bAgainst = bGoals.against || {};

    return {
      league_id,
      team_id,
      season: toInt(season),

      form: res.form ? String(res.form).slice(0, 10) : null,

      fixtures_played_home: nz(played.home),
      fixtures_played_away: nz(played.away),
      fixtures_played_total: nz(played.total),

      wins_home: nz(wins.home),
      wins_away: nz(wins.away),
      wins_total: nz(wins.total),

      draws_home: nz(draws.home),
      draws_away: nz(draws.away),
      draws_total: nz(draws.total),

      loses_home: nz(loses.home),
      loses_away: nz(loses.away),
      loses_total: nz(loses.total),

      goals_for_home: nz(gfTotal.home),
      goals_for_away: nz(gfTotal.away),
      goals_for_total: nz(gfTotal.total),

      goals_against_home: nz(gaTotal.home),
      goals_against_away: nz(gaTotal.away),
      goals_against_total: nz(gaTotal.total),

      avg_goals_for_home: toFloat(gfAvg.home),
      avg_goals_for_away: toFloat(gfAvg.away),
      avg_goals_for_total: toFloat(gfAvg.total),

      avg_goals_against_home: toFloat(gaAvg.home),
      avg_goals_against_away: toFloat(gaAvg.away),
      avg_goals_against_total: toFloat(gaAvg.total),

      clean_sheet_home: nz(clean.home),
      clean_sheet_away: nz(clean.away),
      clean_sheet_total: nz(clean.total),

      failed_to_score_home: nz(fts.home),
      failed_to_score_away: nz(fts.away),
      failed_to_score_total: nz(fts.total),

      penalty_scored_total: nz(pen.scored?.total),
      penalty_scored_percentage: pct(pen.scored?.percentage),
      penalty_missed_total: nz(pen.missed?.total),
      penalty_missed_percentage: pct(pen.missed?.percentage),
      penalty_total: nz(pen.total),

      biggest_streak_wins: toInt(bStreak.wins) ?? 0,
      biggest_streak_draws: toInt(bStreak.draws) ?? 0,
      biggest_streak_loses: toInt(bStreak.loses) ?? 0,

      biggest_win_home: bWins.home ? String(bWins.home).slice(0, 10) : null,
      biggest_win_away: bWins.away ? String(bWins.away).slice(0, 10) : null,
      biggest_lose_home: bLoses.home ? String(bLoses.home).slice(0, 10) : null,
      biggest_lose_away: bLoses.away ? String(bLoses.away).slice(0, 10) : null,

      biggest_goals_for_home: toInt(bFor.home),
      biggest_goals_for_away: toInt(bFor.away),
      biggest_goals_against_home: toInt(bAgainst.home),
      biggest_goals_against_away: toInt(bAgainst.away),
    };
  }

  //  Upsert
  async upsert(row, trx) {
    const where = {
      team_id: row.team_id,
      league_id: row.league_id,
      season: row.season,
    };
    const existing = await this.Model(this.table)
      .transacting(trx)
      .select(this.id)
      .where(where)
      .first();

    if (existing?.[this.id]) {
      const update = { ...row };
      delete update[this.id];
      await this.Model(this.table).transacting(trx).where(where).update(update);
      return "updated";
    }
    await this.Model(this.table).transacting(trx).insert(row);
    return "created";
  }

  //  Read sources
  readSources() {
    const items = [];

    if (this.file && fs.existsSync(this.file)) {
      const raw = fs.readFileSync(this.file, "utf8").replace(/^\uFEFF/, "");
      const json = JSON.parse(raw);

      // Consolidated: { responses:[{team, data}], parameters:{league,season} }
      if (Array.isArray(json?.responses)) {
        for (const r of json.responses) {
          const data = r?.data || {};
          const payload = data?.response || {};
          const p = data?.parameters || {};
          items.push({
            api_team_id: toInt(p?.team) ?? toInt(r?.team),
            api_league_id: toInt(p?.league) ?? null,
            season: toInt(p?.season) ?? null,
            payload,
          });
        }
        return items;
      }

      // Single payload
      if (json?.get === "teams/statistics" && json?.response) {
        items.push({
          api_team_id:
            toInt(json?.parameters?.team) ??
            toInt(json?.response?.team?.id) ??
            null,
          api_league_id:
            toInt(json?.parameters?.league) ??
            toInt(json?.response?.league?.id) ??
            null,
          season:
            toInt(json?.parameters?.season) ??
            toInt(json?.response?.league?.season) ??
            null,
          payload: json.response,
        });
        return items;
      }
    }

    // Directory with per-team files
    if (fs.existsSync(this.dir) && fs.lstatSync(this.dir).isDirectory()) {
      const files = fs
        .readdirSync(this.dir)
        .filter((f) => f.toLowerCase().endsWith(".json"));
      for (const fname of files) {
        const full = path.join(this.dir, fname);
        try {
          const raw = fs.readFileSync(full, "utf8").replace(/^\uFEFF/, "");
          const json = JSON.parse(raw);
          const payload = json?.response || {};
          const p = json?.parameters || {};
          items.push({
            api_team_id: toInt(p?.team) ?? toInt(payload?.team?.id) ?? null,
            api_league_id:
              toInt(p?.league) ?? toInt(payload?.league?.id) ?? null,
            season: toInt(p?.season) ?? toInt(payload?.league?.season) ?? null,
            payload,
          });
        } catch {
          /* ignore unreadable file */
        }
      }
    }

    return items;
  }

  // Import
  async fetchFromFile() {
    const items = this.readSources();

    let created = 0,
      updated = 0,
      failed = 0,
      missed_fk = 0,
      empty = 0;

    const defaultLeague = toInt(this.defaultLeague);
    const defaultSeason = toInt(this.defaultSeason);

    try {
      await this.Model.transaction(async (trx) => {
        for (const it of items) {
          const api_team_id = toInt(it.api_team_id);
          const api_league_id = toInt(it.api_league_id ?? defaultLeague);
          const season = toInt(it.season ?? defaultSeason);
          const payload = it.payload || {};

          if (
            !api_team_id ||
            !api_league_id ||
            !season ||
            !payload ||
            Object.keys(payload).length === 0
          ) {
            empty++;
            continue;
          }

          const [team_id, league_id] = await Promise.all([
            this.getTeamIdByApi(api_team_id),
            this.getLeagueIdByApi(api_league_id),
          ]);
          if (!team_id || !league_id) {
            missed_fk++;
            continue;
          }

          const row = this.buildRow({ league_id, team_id, season, payload });
          const action = await this.upsert(row, trx);
          if (action === "created") created++;
          else updated++;
        }
      });
    } catch (e) {
      failed++;
      return {
        ok: false,
        note: e?.message || String(e),
        processed: items.length,
        created,
        updated,
        missed_fk,
        empty,
        failed,
      };
    }

    return {
      ok: true,
      source: this.file
        ? path.relative(process.cwd(), this.file)
        : path.relative(process.cwd(), this.dir),
      processed: items.length,
      created,
      updated,
      missed_fk,
      empty,
      failed,
    };
  }
}

module.exports = { TeamsStatsService };
