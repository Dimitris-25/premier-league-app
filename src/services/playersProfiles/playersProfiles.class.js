// src/services/playersProfiles/playersProfiles.class.js
// PlayersProfiles class (same pattern as leagues.class)
// Source: local file files/players/2025.json (but public method name stays fetchFromApi)

const fs = require("fs");
const path = require("path");

class PlayersProfiles {
  constructor(options) {
    this.options = options;
    this.Model = options.Model; // Knex instance
    this.table = options.name; // "playersProfiles"
    this.id = options.id; // "player_id"
  }

  // ---------- Standard CRUD (same style as leagues) ----------
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

  // ---------- Custom method (keep same name as leagues) ----------
  // Reads players from files/players/2025.json and upserts into playersProfiles
  async fetchFromApi() {
    const filePath = path.join(process.cwd(), "files", "players", "2025.json");

    const raw = fs.readFileSync(filePath, "utf-8");
    const items = JSON.parse(raw);
    if (!Array.isArray(items)) throw new Error("players file is not an array");

    let created = 0;
    let updated = 0;

    for (const it of items) {
      const p = it?.player || {};
      const statsArr = Array.isArray(it?.statistics) ? it.statistics : [];

      // Prefer statistics row for Premier League (league id 39); fallback to first
      const stat =
        statsArr.find((s) => s?.league?.id === 39) || statsArr[0] || {};

      const apiPlayerId = p?.id ?? null;
      const name = (p?.name || "").trim();
      if (!apiPlayerId || !name) continue;

      const apiTeamId = stat?.team?.id ?? null;

      // ---- Resolve FK team_id from teamsInfo by api_team_id
      let teamId = null;
      if (apiTeamId) {
        const team = await this.Model("teamsInfo")
          .where({ api_team_id: apiTeamId })
          .first();
        if (team) teamId = team.team_id;
      }

      // ---- Build payload according to migration
      const payload = {
        api_player_id: apiPlayerId,
        team_id: teamId, // nullable FK
        api_team_id: apiTeamId, // raw API team id (nullable)
        name,
        firstname: p?.firstname ?? null,
        lastname: p?.lastname ?? null,
        age: p?.age ?? null,
        birth_date: p?.birth?.date ?? null,
        birth_place: p?.birth?.place ?? null,
        birth_country: p?.birth?.country ?? null,
        nationality: p?.nationality ?? null,
        height: p?.height ?? null,
        weight: p?.weight ?? null,
        number: stat?.games?.number ?? null, // shirt number
        position: stat?.games?.position ?? null,
        photo: p?.photo ?? null,
      };

      // ---- Upsert by api_player_id
      const existing = await this.Model(this.table)
        .where({ api_player_id: apiPlayerId })
        .first();

      if (existing) {
        await this.Model(this.table)
          .where({ api_player_id: apiPlayerId })
          .update(payload);
        updated++;
      } else {
        await this.Model(this.table).insert(payload);
        created++;
      }
    }

    return { ok: true, total: items.length, created, updated };
  }
}

module.exports = { PlayersProfiles };
