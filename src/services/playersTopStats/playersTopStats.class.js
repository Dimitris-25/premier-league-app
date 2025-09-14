// src/services/playersTopStats/playersTopStats.class.js
// File-based importer for league-season top player stats (from /players dumps).

const fs = require("fs");
const path = require("path");

// helpers
const toInt = (v) =>
  v === null || v === undefined || v === ""
    ? null
    : Number.isFinite(+v)
      ? +v
      : null;
const nz = (v) => (Number.isFinite(+v) ? +v : 0);

class PlayersTopStatsService {
  constructor(options) {
    this.options = options || {};
    this.Model = this.options.Model; // knex instance

    // Table names (lowercase defaults; override via options if needed)
    this.table = this.options.name || "playerstopstats";
    this.id = this.options.id || "topstat_id";
    this.playersTable = this.options.playersTable || "playersprofiles";
    this.teamsTable = this.options.teamsTable || "teamsinfo";
    this.leaguesTable = this.options.leaguesTable || "leagues";
    this.seasonsTable = this.options.seasonsTable || "seasons";

    // Optional fallbacks when file doesn't contain league/season
    this.defaultLeague = this.options.defaultLeague ?? null; // api_league_id
    this.defaultSeason = this.options.defaultSeason ?? null; // season year

    // Input file
    this.file =
      this.options.file ||
      path.resolve(process.cwd(), "files", "players", "playersStats2025.json");
  }

  // ---------- CRUD (same style as EventsService) ----------
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

  //  Read & parse file
  readBlocks() {
    if (!fs.existsSync(this.file)) {
      throw new Error(`[playersTopStats] File not found: ${this.file}`);
    }
    const raw = fs.readFileSync(this.file, "utf8").replace(/^\uFEFF/, "");
    let json;
    try {
      json = JSON.parse(raw);
    } catch {
      json = {};
    }

    // Support payload: { get:"players", response:[...] } or plain array
    const blocks = Array.isArray(json?.response)
      ? json.response
      : Array.isArray(json)
        ? json
        : [];

    // Infer league/season from first stats entry or top-level parameters
    const topStat = blocks?.[0]?.statistics?.[0] || {};
    const api_league_id =
      toInt(topStat?.league?.id) || toInt(json?.parameters?.league) || null;
    const season =
      toInt(topStat?.league?.season) || toInt(json?.parameters?.season) || null;

    return { blocks, api_league_id, season };
  }

  //  FK lookups
  async getLeagueIdByApi(api_league_id) {
    if (!api_league_id) return null;
    const row = await this.Model(this.leaguesTable)
      .select("league_id")
      .where("api_league_id", api_league_id)
      .first();
    return row?.league_id ?? null;
  }
  async getTeamIdByApi(api_team_id) {
    if (!api_team_id) return null;
    const row = await this.Model(this.teamsTable)
      .select("team_id")
      .where("api_team_id", api_team_id)
      .first();
    return row?.team_id ?? null;
  }
  async getPlayerIdByApi(api_player_id) {
    if (!api_player_id) return null;
    const row = await this.Model(this.playersTable)
      .select("player_id")
      .where("api_player_id", api_player_id)
      .first();
    return row?.player_id ?? null;
  }
  async getSeasonIdByYear(year) {
    if (!year) return null;
    const row = await this.Model(this.seasonsTable)
      .select("season_id")
      .where("season_year", year)
      .first();
    return row?.season_id ?? null;
  }

  //  Aggregate one player's statistics across transfers for a league+season
  // Returns null if no matching stat for that league/season
  collapsePlayerStats(statArr, api_league_id, season) {
    const stats = Array.isArray(statArr) ? statArr : [];

    // keep only entries for requested league+season
    const filtered = stats.filter(
      (s) =>
        toInt(s?.league?.id) === api_league_id &&
        toInt(s?.league?.season) === season
    );
    if (!filtered.length) return null;

    // sum totals; choose team with most appearances (fallback first)
    let goals_total = 0,
      assists_total = 0,
      yellow_cards = 0,
      red_cards = 0;

    let pickTeamApiId = null;
    let maxApps = -1;

    for (const st of filtered) {
      goals_total += nz(st?.goals?.total);
      assists_total += nz(st?.goals?.assists);
      yellow_cards += nz(st?.cards?.yellow);
      red_cards += nz(st?.cards?.red);

      const apps = nz(st?.games?.appearences);
      if (apps > maxApps) {
        maxApps = apps;
        pickTeamApiId = toInt(st?.team?.id) || pickTeamApiId;
      }
    }
    if (!pickTeamApiId) pickTeamApiId = toInt(filtered[0]?.team?.id) || null;

    return {
      api_team_id: pickTeamApiId,
      goals_total,
      assists_total,
      yellow_cards,
      red_cards,
    };
  }

  //  Build DB row
  buildRow({ league_id, season_id, player_id, team_id, agg }) {
    return {
      league_id,
      season_id, // FK → seasons
      player_id,
      team_id,
      goals_total: nz(agg?.goals_total),
      assists_total: nz(agg?.assists_total),
      yellow_cards: nz(agg?.yellow_cards),
      red_cards: nz(agg?.red_cards),
      rank: null, // not provided by source
    };
  }

  //  Import from file (delete+insert per league+season)
  async fetchFromFile() {
    let { blocks, api_league_id, season } = this.readBlocks();

    // fallbacks: options → env
    api_league_id =
      api_league_id ??
      toInt(this.defaultLeague) ??
      toInt(process.env.PTS_LEAGUE);
    season =
      season ?? toInt(this.defaultSeason) ?? toInt(process.env.PTS_SEASON);

    if (!api_league_id || !season) {
      return {
        file: path.relative(process.cwd(), this.file),
        rows_written: 0,
        failed: 0,
        missed_fk: 0,
        empty_blocks: Array.isArray(blocks) ? blocks.length : 0,
        note: "Could not infer league/season (file/options/env). Expecting a /players dump or set PTS_LEAGUE / PTS_SEASON.",
      };
    }

    // resolve FKs
    const league_id = await this.getLeagueIdByApi(api_league_id);
    if (!league_id) {
      return {
        file: path.relative(process.cwd(), this.file),
        rows_written: 0,
        failed: 0,
        missed_fk: 0,
        empty_blocks: Array.isArray(blocks) ? blocks.length : 0,
        note: `No league found in DB for api_league_id=${api_league_id}.`,
      };
    }

    const season_id = await this.getSeasonIdByYear(season);
    if (!season_id) {
      return {
        file: path.relative(process.cwd(), this.file),
        rows_written: 0,
        failed: 0,
        missed_fk: 0,
        empty_blocks: Array.isArray(blocks) ? blocks.length : 0,
        note: `No season found in DB for season_year=${season}.`,
      };
    }

    // aggregate per player
    const rows = [];
    let missed_fk = 0;

    for (const item of blocks) {
      const api_player_id = toInt(item?.player?.id);
      const agg = this.collapsePlayerStats(
        item?.statistics,
        api_league_id,
        season
      );
      if (!api_player_id || !agg) continue;

      const [player_id, team_id] = await Promise.all([
        this.getPlayerIdByApi(api_player_id),
        this.getTeamIdByApi(agg.api_team_id),
      ]);

      if (!player_id || !team_id) {
        missed_fk++;
        continue;
      }

      rows.push(
        this.buildRow({ league_id, season_id, player_id, team_id, agg })
      );
    }

    let rows_written = 0;
    let failed = 0;
    const sample_errors = [];

    try {
      await this.Model.transaction(async (trx) => {
        // clear existing rows for this league+season
        await this.Model(this.table)
          .transacting(trx)
          .where({ league_id, season_id })
          .del();

        if (rows.length) {
          await this.Model(this.table).transacting(trx).insert(rows);
          rows_written = rows.length;
        }
      });
    } catch (err) {
      failed++;
      if (sample_errors.length < 5) {
        sample_errors.push(err?.sqlMessage || err?.message || String(err));
      }
    }

    return {
      file: path.relative(process.cwd(), this.file),
      api_league_id,
      season, // info only (not stored)
      rows_written,
      missed_fk,
      failed,
      sample_errors,
    };
  }
}

module.exports = { PlayersTopStatsService };
