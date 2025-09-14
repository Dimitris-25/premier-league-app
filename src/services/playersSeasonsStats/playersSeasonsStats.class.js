// Import season-aggregate player stats from API-Football (/players)

const axios = require("axios");

class PlayersSeasonStatsService {
  constructor(options) {
    this.options = options;
    this.Model = options.Model; // Knex
    this.table = options.name; // "playersseasonstats"
    this.id = options.id; // "pss_id"

    // Related tables (FK lookups)
    this.playersTable = "playersprofiles";
    this.teamsTable = "teamsinfo";
    this.leaguesTable = "leagues";
  }

  //  Standard CRUD (Feathers style)
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

  //  Small helpers
  toInt(v) {
    return v === null || v === undefined || v === ""
      ? null
      : Number.isFinite(+v)
        ? +v
        : null;
  }
  toBool(v) {
    return v === null || v === undefined ? null : !!v;
  }
  toRating(v) {
    if (v === null || v === undefined || v === "") return null;
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  }

  // FK lookups by API ids
  async getPlayerIdByApi(api_player_id) {
    if (!api_player_id) return null;
    const r = await this.Model(this.playersTable)
      .select("player_id")
      .where("api_player_id", api_player_id)
      .first();
    return r?.player_id ?? null;
  }
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

  // Build DB row from one statistics object
  buildRow({ player_id, team_id, league_id, season, stat }) {
    const toInt = this.toInt.bind(this),
      toBool = this.toBool.bind(this),
      toRating = this.toRating.bind(this);

    const g = stat?.games || {};
    const subs = stat?.substitutes || {};
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
      player_id,
      team_id,
      league_id,
      season: toInt(season),

      // Games
      games_appearences: toInt(g?.appearences),
      games_lineups: toInt(g?.lineups),
      games_minutes: toInt(g?.minutes),
      games_number: toInt(g?.number),
      games_position: g?.position ?? null,
      games_rating: toRating(g?.rating),
      games_captain: toBool(g?.captain),

      // Substitutes
      subs_in: toInt(subs?.in),
      subs_out: toInt(subs?.out),
      subs_bench: toInt(subs?.bench),

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
      cards_yellowred: toInt(cards?.yellowred),
      cards_red: toInt(cards?.red),

      // Penalties (keep API spelling)
      penalty_won: toInt(pen?.won),
      penalty_commited: toInt(pen?.commited),
      penalty_scored: toInt(pen?.scored),
      penalty_missed: toInt(pen?.missed),
      penalty_saved: toInt(pen?.saved),
    };
  }

  // Upsert by (player_id, team_id, league_id, season)
  async upsert(row, trx) {
    const where = {
      player_id: row.player_id,
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

  // 🔹 Custom method: fetch from API-Football
  async fetchFromApi() {
    const { API_KEY } = process.env;
    if (!API_KEY) throw new Error("API_KEY is not set");

    // Keep params inline (same style as LeaguesService)
    const league = 39;
    const season = 2025;

    const client = axios.create({
      baseURL: "https://v3.football.api-sports.io",
      headers: { "x-apisports-key": API_KEY },
      timeout: 30000,
    });

    let page = 1;
    let total = 1; // will be updated by paging
    let created = 0,
      updated = 0,
      missed_fk = 0,
      failed = 0;

    do {
      const { data } = await client.get("/players", {
        params: { league, season, page },
      });

      const items = Array.isArray(data?.response) ? data.response : [];
      const paging = data?.paging || {};
      total = this.toInt(paging?.total) || 1;

      await this.Model.transaction(async (trx) => {
        for (const it of items) {
          try {
            const api_player_id = this.toInt(it?.player?.id);
            const player_id = await this.getPlayerIdByApi(api_player_id);
            const stats = Array.isArray(it?.statistics) ? it.statistics : [];

            for (const st of stats) {
              // Keep only requested league/season (in case of transfers)
              const api_league_id = this.toInt(st?.league?.id);
              const statSeason = this.toInt(st?.league?.season);
              if (api_league_id !== league || statSeason !== season) continue;

              const api_team_id = this.toInt(st?.team?.id);
              const team_id = await this.getTeamIdByApi(api_team_id);
              const league_id = await this.getLeagueIdByApi(api_league_id);

              if (!player_id || !team_id || !league_id) {
                missed_fk++;
                continue;
              }

              const row = this.buildRow({
                player_id,
                team_id,
                league_id,
                season,
                stat: st,
              });

              // Upsert by composite key
              const id = await this.upsert(row, trx);
              if (id) {
                updated++; // treat upsert as update by default
              } else {
                created++; // should not normally happen, but keep counters symmetrical
              }
            }
          } catch (e) {
            failed++;
          }
        }
      });

      page++;
    } while (page <= total);

    return {
      ok: true,
      params: { league, season },
      pages: total,
      created,
      updated,
      missed_fk,
      failed,
    };
  }
}

module.exports = { PlayersSeasonStatsService };
