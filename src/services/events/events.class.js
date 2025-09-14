// Same pattern as fixturesStats.class.js — minimal CRUD + import from file.
// Reads files/events/2025.json, maps API ids to DB ids, writes to "events".

const fs = require("fs");
const path = require("path");

class EventsService {
  constructor(options) {
    this.Model = options.Model; // knex
    this.table = options.name; // 'events'
    this.id = options.id; // 'event_id'

    this.fixturesTable = "fixtures"; // api_fixture_id -> fixture_id
    this.teamsTable = "teamsInfo"; // api_team_id    -> team_id

    this.file =
      options.file ||
      path.resolve(process.cwd(), "files", "events", "2025.json");
  }

  // CRUD (like fixturesStats)
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

  // File helpers
  readBlocks() {
    const raw = fs.readFileSync(this.file, "utf8").replace(/^\uFEFF/, "");
    let json;
    try {
      json = JSON.parse(raw);
    } catch {
      json = {};
    }

    // File sample you showed: { results: [ { id, response:{ body: "<json string>" } }, ... ] }
    const blocks = Array.isArray(json?.results)
      ? json.results
      : Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json)
          ? json
          : [];

    return blocks;
  }

  parseBody(bodyStr) {
    // bodyStr is the API-Football payload as stringified JSON
    if (typeof bodyStr !== "string") return { apiFixtureId: null, events: [] };
    try {
      const p = JSON.parse(bodyStr);
      const apiFixtureId = Number(p?.parameters?.fixture) || null;
      const events = Array.isArray(p?.response) ? p.response : [];
      return { apiFixtureId, events };
    } catch {
      return { apiFixtureId: null, events: [] };
    }
  }

  // ---------- DB lookups ----------
  async getFixtureIdByApi(apiFixtureId) {
    if (!apiFixtureId) return null;
    const row = await this.Model(this.fixturesTable)
      .select("fixture_id")
      .where("api_fixture_id", apiFixtureId)
      .first();
    return row?.fixture_id ?? null;
  }

  async getTeamIdByApi(apiTeamId) {
    if (!apiTeamId) return null;
    const row = await this.Model(this.teamsTable)
      .select("team_id")
      .where("api_team_id", apiTeamId)
      .first();
    return row?.team_id ?? null; // nullable FK is allowed by migration
  }

  //  Row builder
  toRow({ fixture_id, team_id, ev }) {
    const t = ev?.time || {};
    const team = ev?.team || {};
    const player = ev?.player || {};
    const assist = ev?.assist || {};

    const n = (v) => (Number.isFinite(+v) ? +v : null);
    const s = (v, max) => (v == null ? null : String(v).slice(0, max));

    return {
      fixture_id,
      team_id, // mapped internal id (nullable)
      time_elapsed: n(t.elapsed) ?? 0,
      time_extra: n(t.extra),

      team_name: s(team.name, 100),
      team_logo: s(team.logo, 255),

      player_id: n(player.id),
      player_name: s(player.name, 100),

      assist_id: n(assist.id),
      assist_name: s(assist.name, 100),

      type: s(ev?.type || "Unknown", 50) || "Unknown",
      detail: s(ev?.detail || "Unknown", 50) || "Unknown",
      comments: s(ev?.comments, 255),
    };
  }

  // Import (same style as fixturesStats: delete+insert per fixture)
  async fetchFromApi() {
    const blocks = this.readBlocks();

    let fixtures_in_file = 0;
    let rows_written = 0;
    let missing_fixture = 0;
    let missing_team = 0;
    let empty_blocks = 0;
    let failed = 0;
    const sample_errors = [];

    for (const b of blocks) {
      const bodyStr = b?.response?.body || b?.body || null;
      const { apiFixtureId, events } = this.parseBody(bodyStr);
      const apiId = Number(b?.id) || apiFixtureId;

      if (!apiId || !events.length) {
        empty_blocks++;
        continue;
      }

      const fixture_id = await this.getFixtureIdByApi(apiId);
      if (!fixture_id) {
        missing_fixture++;
        continue;
      }

      fixtures_in_file++;

      try {
        await this.Model.transaction(async (trx) => {
          // clear existing and re-insert (simple and safe)
          await this.Model(this.table)
            .transacting(trx)
            .where({ fixture_id })
            .del();

          const teamCache = new Map();
          const rows = [];
          for (const ev of events) {
            const apiTeamId = Number(ev?.team?.id) || null;
            let team_id = null;
            if (apiTeamId) {
              if (teamCache.has(apiTeamId)) {
                team_id = teamCache.get(apiTeamId);
              } else {
                team_id = await this.getTeamIdByApi(apiTeamId);
                teamCache.set(apiTeamId, team_id);
              }
              if (team_id == null) missing_team++;
            }
            rows.push(this.toRow({ fixture_id, team_id, ev }));
          }

          if (rows.length) {
            await this.Model(this.table).transacting(trx).insert(rows);
            rows_written += rows.length;
          }
        });
      } catch (err) {
        failed++;
        if (sample_errors.length < 5) {
          sample_errors.push(err?.sqlMessage || err?.message || String(err));
        }
      }
    }

    return {
      file: path.relative(process.cwd(), this.file),
      fixtures_in_file,
      rows_written,
      missing_fixture,
      missing_team,
      empty_blocks,
      failed,
      sample_errors,
    };
  }
}

module.exports = { EventsService };
