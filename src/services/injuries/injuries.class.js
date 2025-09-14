// src/services/injuries/injuries.class.js
// Import injuries from API-Football (/injuries?league=39&season=2025)
// Upsert key matches DB unique: (player_id, team_id, league_id, season, fixture_id)

const axios = require("axios");

class InjuriesService {
  constructor(options) {
    this.options = options || {};
    this.Model = this.options.Model;
    this.table = this.options.name || "injuries";
    this.id = this.options.id || "injury_id";

    // FK tables (configurable; defaults match your DB)
    this.playersTable = this.options.playersTable || "playersprofiles";
    this.teamsTable = this.options.teamsTable || "teamsinfo";
    this.leaguesTable = this.options.leaguesTable || "leagues";
    this.fixturesTable = this.options.fixturesTable || "fixtures";
  }

  // CRUD
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

  // Helpers
  toInt(v) {
    return v === null || v === undefined || v === ""
      ? null
      : Number.isFinite(+v)
        ? +v
        : null;
  }
  toStr(v, maxLen) {
    if (v === null || v === undefined) return null;
    const s = String(v);
    return maxLen ? s.slice(0, maxLen) : s;
  }
  toUnix(v) {
    if (v === null || v === undefined || v === "") return null;
    const n = +v;
    if (Number.isFinite(n) && String(v).trim().length <= 12) return n; // already unix
    const t = Date.parse(v);
    return Number.isFinite(t) ? Math.floor(t / 1000) : null;
  }
  toUtcTimestamp(v) {
    if (!v) return null;
    const d = new Date(v);
    return isNaN(d.getTime())
      ? null
      : new Date(d.toISOString().replace("Z", "")); // MySQL TIMESTAMP
  }

  // FK lookups (by API ids)
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
  async getFixtureIdByApi(api_fixture_id) {
    if (!api_fixture_id) return null;
    const r = await this.Model(this.fixturesTable)
      .select("fixture_id")
      .where("api_fixture_id", api_fixture_id)
      .first();
    return r?.fixture_id ?? null; // nullable per schema
  }

  // Row builder
  buildRow({ player_id, team_id, league_id, season, fixture_id, item }) {
    const type = this.toStr(item?.player?.type, 100);
    const reason = this.toStr(item?.player?.reason, 255);
    const tz = this.toStr(item?.fixture?.timezone, 50) || "UTC";
    const dateISO = item?.fixture?.date || null;

    return {
      player_id,
      team_id,
      league_id,
      season: this.toInt(season),
      fixture_id: fixture_id ?? null, // nullable

      type,
      reason,

      date_utc: this.toUtcTimestamp(dateISO), // TIMESTAMP
      timezone: tz,
      timestamp: this.toUnix(item?.fixture?.timestamp), // BIGINT (unix seconds)
    };
  }

  // Upsert on composite key
  async upsert(row, trx) {
    const base = {
      player_id: row.player_id,
      team_id: row.team_id,
      league_id: row.league_id,
      season: row.season,
    };

    // Handle nullable fixture_id in WHERE
    let q = this.Model(this.table).transacting(trx).select(this.id).where(base);
    if (row.fixture_id == null) q = q.whereNull("fixture_id");
    else q = q.where("fixture_id", row.fixture_id);

    const existing = await q.first();

    if (existing?.[this.id]) {
      const update = { ...row };
      delete update[this.id];
      if (row.fixture_id == null) {
        await this.Model(this.table)
          .transacting(trx)
          .where(base)
          .whereNull("fixture_id")
          .update(update);
      } else {
        await this.Model(this.table)
          .transacting(trx)
          .where(base)
          .where("fixture_id", row.fixture_id)
          .update(update);
      }
      return { action: "updated", id: existing[this.id] };
    }

    const [pk] = await this.Model(this.table).transacting(trx).insert(row);
    return { action: "created", id: pk };
  }

  // Fetch from API-Football
  async fetchFromApi({ league, season } = {}) {
    const { API_KEY } = process.env;
    if (!API_KEY) throw new Error("API_KEY is not set");

    league = this.toInt(league) || 39;
    season = this.toInt(season) || 2025;

    const client = axios.create({
      baseURL: "https://v3.football.api-sports.io",
      headers: { "x-apisports-key": API_KEY },
      timeout: 30000,
    });

    let created = 0,
      updated = 0,
      missed_fk = 0,
      failed = 0;
    const sample_errors = [];

    const { data } = await client.get("/injuries", {
      params: { league, season },
    });
    const items = Array.isArray(data?.response) ? data.response : [];

    await this.Model.transaction(async (trx) => {
      for (const it of items) {
        try {
          const api_player_id = this.toInt(it?.player?.id);
          const api_team_id = this.toInt(it?.team?.id);
          const api_league_id = this.toInt(it?.league?.id) || league;
          const api_fixture_id = this.toInt(it?.fixture?.id); // nullable

          const [player_id, team_id, league_id, fixture_id] = await Promise.all(
            [
              this.getPlayerIdByApi(api_player_id),
              this.getTeamIdByApi(api_team_id),
              this.getLeagueIdByApi(api_league_id),
              this.getFixtureIdByApi(api_fixture_id),
            ]
          );

          // Require core FKs; fixture may be null
          if (!player_id || !team_id || !league_id) {
            missed_fk++;
            continue;
          }

          const row = this.buildRow({
            player_id,
            team_id,
            league_id,
            season,
            fixture_id,
            item: it,
          });

          const { action } = await this.upsert(row, trx);
          if (action === "created") created++;
          else updated++;
        } catch (e) {
          failed++;
          if (sample_errors.length < 5)
            sample_errors.push(e?.sqlMessage || e?.message || String(e));
        }
      }
    });

    return {
      ok: true,
      params: { league, season },
      received: items.length,
      created,
      updated,
      missed_fk,
      failed,
      sample_errors,
    };
  }
}

module.exports = { InjuriesService };
