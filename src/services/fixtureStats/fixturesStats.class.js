// src/services/playersFixturesStats/playersFixturesStats.class.js

const fs = require("fs");
const path = require("path");

const toInt = (v) =>
  v === null || v === undefined || v === ""
    ? null
    : Number.isFinite(+v)
      ? +v
      : null;
const toBool = (v) => (v === null || v === undefined ? null : !!v);
const toRating = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
};

class PlayersFixturesStatsService {
  constructor(options) {
    this.options = options;
    this.Model = options.Model; // knex
    this.table = options.name; // 'playersFixturesStats'
    this.id = options.id || "id"; // PK
    this.file = options.file; // optional absolute file path
    this.fixturesTable = "fixtures";
    this.teamsTable = "teamsInfo";
    this.playersTable = "playersProfiles";
  }

  // ---------- CRUD ----------
  async find() {
    return this.Model(this.table).select("*");
  }
  async get(id) {
    return this.Model(this.table).where(this.id, id).first();
  }
  async create(data) {
    const [inserted] = await this.Model(this.table).insert(data);
    return { ...data, [this.id]: inserted };
  }
  async patch(id, data) {
    await this.Model(this.table).where(this.id, id).update(data);
    return this.get(id);
  }
  async remove(id) {
    await this.Model(this.table).where(this.id, id).del();
    return { id };
  }

  // ---------- File helpers ----------
  getInputFile() {
    return (
      this.file ||
      path.resolve(process.cwd(), "files", "players", "playersStats2025.json")
    );
  }
  readItems() {
    const file = this.getInputFile();
    if (!fs.existsSync(file)) {
      throw new Error(`[playersFixturesStats] File not found: ${file}`);
    }
    const raw = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
    const json = JSON.parse(raw);

    // We support:
    // A) /fixtures/players → { get:"fixtures/players", parameters:{fixture:"..."}, response:[ {team:{...}, players:[{player:{...}, statistics:[...]}, ...]}, ...] }
    // B) /players (season aggregates) → { get:"players", response:[ {player:{...}, statistics:[{team:{...}, league:{...}, games...}]}, ...] }
    const get = String(json?.get || "").toLowerCase();

    if (get.includes("fixtures/players")) {
      const api_fixture_id =
        toInt(json?.parameters?.fixture) ?? toInt(json?.fixture?.id) ?? null;

      const blocks = Array.isArray(json?.response) ? json.response : [];
      return { file, mode: "fixturesPlayers", api_fixture_id, blocks };
    }

    // Fallback to "players" aggregate
    const blocks = Array.isArray(json?.response)
      ? json.response
      : Array.isArray(json)
        ? json
        : [];
    return { file, mode: "playersAggregate", api_fixture_id: null, blocks };
  }

  //  DB lookups
  async getFixtureByApi(api_fixture_id) {
    if (!api_fixture_id) return null;
    const r = await this.Model(this.fixturesTable)
      .select(["fixture_id", "league_id", "season"])
      .where("api_fixture_id", api_fixture_id)
      .first();
    return r || null;
  }
  async getTeamIdByApi(api_team_id) {
    if (!api_team_id) return null;
    // primary: api_team_id
    let row = await this.Model(this.teamsTable)
      .select("team_id")
      .where("api_team_id", api_team_id)
      .first();
    if (row?.team_id) return row.team_id;

    // fallback: team_id equals api id (in case the export already stored local ids)
    row = await this.Model(this.teamsTable)
      .select("team_id")
      .where("team_id", api_team_id)
      .first();
    return row?.team_id ?? null;
  }
  async getPlayerIdByApi(api_player_id) {
    if (!api_player_id) return null;
    let row = await this.Model(this.playersTable)
      .select("player_id")
      .where("api_player_id", api_player_id)
      .first();
    if (row?.player_id) return row.player_id;

    // fallback: local id happens to equal api id
    row = await this.Model(this.playersTable)
      .select("player_id")
      .where("player_id", api_player_id)
      .first();
    return row?.player_id ?? null;
  }

  //  Row builder
  buildRow({ fixture, team_id, player_id, stat }) {
    const g = stat?.games || {};
    const shots = stat?.shots || {};
    const goals = stat?.goals || {};
    const passes = stat?.passes || {};
    const tackles = stat?.tackles || {};
    const duels = stat?.duels || {};
    const dribbles = stat?.dribbles || {};
    const fouls = stat?.fouls || {};
    const cards = stat?.cards || {};
    const pen = stat?.penalty || {};

    return {
      // FKs required by migration
      fixture_id: fixture.fixture_id,
      api_fixture_id: toInt(fixture.api_fixture_id),
      team_id,
      player_id,
      league_id: fixture.league_id ?? null,
      season: toInt(fixture.season) ?? null,

      // Games
      games_minutes: toInt(g?.minutes),
      games_number: toInt(g?.number),
      games_position: g?.position ?? null,
      games_rating: toRating(g?.rating),
      games_captain: toBool(g?.captain),
      games_substitute: toBool(g?.substitute),

      // Others
      offsides: toInt(stat?.offsides),

      // Shots
      shots_total: toInt(shots?.total),
      shots_on: toInt(shots?.on),

      // Goals
      goals_total: toInt(goals?.total),
      goals_conceded: toInt(goals?.conceded),
      goals_assists: toInt(goals?.assists),
      goals_saves: toInt(goals?.saves),

      // Passes
      passes_total: toInt(passes?.total),
      passes_key: toInt(passes?.key),
      passes_accuracy: toInt(passes?.accuracy),

      // Tackles
      tackles_total: toInt(tackles?.total),
      tackles_blocks: toInt(tackles?.blocks),
      tackles_interceptions: toInt(tackles?.interceptions),

      // Duels
      duels_total: toInt(duels?.total),
      duels_won: toInt(duels?.won),

      // Dribbles
      dribbles_attempts: toInt(dribbles?.attempts),
      dribbles_success: toInt(dribbles?.success),
      dribbles_past: toInt(dribbles?.past),

      // Fouls
      fouls_drawn: toInt(fouls?.drawn),
      fouls_committed: toInt(fouls?.committed),

      // Cards
      cards_yellow: toInt(cards?.yellow),
      cards_red: toInt(cards?.red),

      // Penalties
      penalty_won: toInt(pen?.won),
      penalty_commited: toInt(pen?.commited),
      penalty_scored: toInt(pen?.scored),
      penalty_missed: toInt(pen?.missed),
      penalty_saved: toInt(pen?.saved),
    };
  }

  async upsert(row, trx) {
    const where = { fixture_id: row.fixture_id, player_id: row.player_id };
    const existing = await this.Model(this.table)
      .transacting(trx)
      .select(this.id)
      .where(where)
      .first();
    if (existing?.[this.id]) {
      const update = { ...row };
      delete update[this.id];
      await this.Model(this.table).transacting(trx).where(where).update(update);
      return existing[this.id];
    }
    await this.Model(this.table).transacting(trx).insert(row);
    const inserted = await this.Model(this.table)
      .transacting(trx)
      .select(this.id)
      .where(where)
      .first();
    return inserted?.[this.id] ?? null;
  }

  // Import from file (fixtures/players preferred)
  async fetchFromFile() {
    const { file, mode, api_fixture_id, blocks } = this.readItems();

    let fixtures_processed = 0;
    let rows_written = 0;
    let missed_fk = 0;
    let failed = 0;
    let skipped_no_fixture = 0;
    const sample_errors = [];

    if (mode === "playersAggregate") {
      // Migration requires fixture_id; we can’t attach aggregates safely.
      // Keep counters explicit so it’s obvious why nothing was written.
      return {
        file: path.relative(process.cwd(), file),
        mode,
        fixtures_processed,
        rows_written,
        missed_fk,
        failed,
        skipped_no_fixture: Array.isArray(blocks) ? blocks.length : 0,
        sample_errors,
        note: "File looks like /players (season aggregates). Use a /fixtures/players dump to import fixture-scoped stats.",
      };
    }

    // mode: fixturesPlayers
    // Resolve the single fixture row we will attach to.
    const fx = await this.getFixtureByApi(api_fixture_id);
    if (!fx?.fixture_id) {
      // No matching fixture → can’t insert any row.
      return {
        file: path.relative(process.cwd(), file),
        mode,
        fixtures_processed,
        rows_written,
        missed_fk,
        failed,
        skipped_no_fixture: Array.isArray(blocks) ? blocks.length : 0,
        sample_errors,
        note: `No fixture found in DB for api_fixture_id=${api_fixture_id}.`,
      };
    }

    // Shape: response[ { team:{id}, players:[ {player:{id}, statistics:[{...}]}, ... ] }, ... ]
    for (const teamBlock of blocks) {
      const api_team_id = toInt(teamBlock?.team?.id);
      const team_id = await this.getTeamIdByApi(api_team_id);
      const players = Array.isArray(teamBlock?.players)
        ? teamBlock.players
        : [];

      if (!team_id) {
        missed_fk += players.length || 1;
        continue;
      }

      fixtures_processed++;

      await this.Model.transaction(async (trx) => {
        for (const p of players) {
          try {
            const api_player_id = toInt(p?.player?.id);
            const player_id = await this.getPlayerIdByApi(api_player_id);
            const statsArr = Array.isArray(p?.statistics) ? p.statistics : [];
            const stat = statsArr[0] || {}; // one entry per player for that fixture

            if (!player_id) {
              missed_fk++;
              continue;
            }

            const row = this.buildRow({
              fixture: { ...fx, api_fixture_id },
              team_id,
              player_id,
              stat,
            });

            await this.upsert(row, trx);
            rows_written++;
          } catch (e) {
            failed++;
            if (sample_errors.length < 5)
              sample_errors.push(e?.sqlMessage || e?.message || String(e));
          }
        }
      });
    }

    return {
      file: path.relative(process.cwd(), file),
      mode,
      api_fixture_id,
      fixtures_processed,
      rows_written,
      missed_fk,
      failed,
      skipped_no_fixture,
      sample_errors,
    };
  }
}

module.exports = { PlayersFixturesStatsService };
