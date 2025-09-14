// src/services/transfers/transfers.class.js
// Importer/CRUD for transfers — reads local JSON produced by fetch-transfers-2025.js
// Table: transfers(transfer_id PK, player_id, team_in_id, team_out_id, date, type, update_date)

const fs = require("fs");
const path = require("path");

class Transfers {
  constructor(options) {
    this.options = options;
    this.Model = options.Model; // knex instance
    this.table = options.name; // "transfers"

    // FK tables (match your migration)
    this.playersTable = options.playersTable || "playersProfiles";
    this.teamsTable = options.teamsTable || "teamsInfo";
  }

  // ---------- CRUD ----------
  async find() {
    return this.Model(this.table).select("*");
  }
  async get(id) {
    return this.Model(this.table).where("transfer_id", id).first();
  }
  async create(data) {
    const [id] = await this.Model(this.table).insert(data);
    return { ...data, transfer_id: id };
  }
  async patch(id, data) {
    await this.Model(this.table).where("transfer_id", id).update(data);
    return this.get(id);
  }
  async remove(id) {
    await this.Model(this.table).where("transfer_id", id).del();
    return { id };
  }

  // ---------- Helpers ----------
  #toDateStr(v) {
    if (!v) return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10); // YYYY-MM-DD
  }
  #isValidDateStr(v) {
    return !!this.#toDateStr(v);
  }

  //  Import from local file
  async fetchFromApi() {
    // 1) Read local file made by scripts/fetch-transfers-2025.js
    const filePath = path.join(
      process.cwd(),
      "files",
      "transfers",
      "transfers_after_2025-04-28.json"
    );

    let payload;
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      payload = JSON.parse(raw);
    } catch (e) {
      throw new Error(`Cannot read transfers file: ${filePath}`);
    }

    const items = Array.isArray(payload?.items) ? payload.items : [];
    if (!items.length) {
      return {
        ok: true,
        source: filePath,
        total: 0,
        created: 0,
        updated: 0,
        skipped: 0,
      };
    }

    // 2) Build FK maps (api -> local ids)
    const players = await this.Model(this.playersTable).select(
      "player_id",
      "api_player_id"
    );
    const playerMap = new Map(
      players.map((p) => [Number(p.api_player_id), p.player_id])
    );

    const teams = await this.Model(this.teamsTable).select(
      "team_id",
      "api_team_id"
    );
    const teamMap = new Map(
      teams.map((t) => [Number(t.api_team_id), t.team_id])
    );

    // 3) Upsert
    let created = 0,
      updated = 0,
      skipped = 0;
    const reasons = { playerMissing: 0, invalidDate: 0 };

    for (const it of items) {
      const api_player_id = Number(it?.player_api_id) || null;
      const player_id = api_player_id
        ? playerMap.get(api_player_id) || null
        : null;
      if (!player_id) {
        skipped++;
        reasons.playerMissing++;
        continue;
      }

      const team_in_id = it?.to_team_api_id
        ? teamMap.get(Number(it.to_team_api_id)) || null
        : null;
      const team_out_id = it?.from_team_api_id
        ? teamMap.get(Number(it.from_team_api_id)) || null
        : null;

      const dateStr = this.#toDateStr(it?.date);
      if (!dateStr) {
        skipped++;
        reasons.invalidDate++;
        continue;
      }

      const row = {
        player_id,
        team_in_id,
        team_out_id,
        date: dateStr, // DATE (YYYY-MM-DD)
        type: it?.type ?? null,
        update_date: it?.update_date ? new Date(it.update_date) : null, // TIMESTAMP or null
      };

      // composite key: (player_id, team_in_id, team_out_id, date) with null-safe handling
      const base = { player_id, date: dateStr };

      let q = this.Model(this.table).select("transfer_id").where(base);
      if (team_in_id == null) q = q.whereNull("team_in_id");
      else q = q.where("team_in_id", team_in_id);
      if (team_out_id == null) q = q.whereNull("team_out_id");
      else q = q.where("team_out_id", team_out_id);

      const existing = await q.first();

      if (existing?.transfer_id) {
        await this.Model(this.table)
          .where({ transfer_id: existing.transfer_id })
          .update({ type: row.type, update_date: row.update_date });
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

module.exports = { Transfers };
