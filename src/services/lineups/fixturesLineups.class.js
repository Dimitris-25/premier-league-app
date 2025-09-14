// src/services/lineups/fixturesLineups.class.js
// Feathers service for importing lineups into MySQL (Knex).
// Tables (per your migrations):
//   - fixturesLineUps           (PK: lineup_id, UNIQUE: fixture_id + team_id)
//   - fixturesLineUpsPlayers    (FK: lineup_id -> fixturesLineUps.lineup_id)

const fs = require("fs");
const path = require("path");

class FixturesLineupsService {
  constructor(options) {
    this.Model = options.Model; // Knex client (function)
    this.table = options.name; // 'fixturesLineUps'
    this.id = options.id; // 'lineup_id'
    this.playersTable = "fixturesLineUpsPlayers";
    this.fixturesTable = "fixtures";
    this.teamsTable = "teamsInfo";
    this.coachesTable = "coaches";
    this.playersProf = "playersProfiles";
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

  // ---------- File helpers ----------
  getLineupsFile() {
    return path.resolve(process.cwd(), "files", "lineups", "lineups_2025.json");
  }
  readItems() {
    const file = this.getLineupsFile();
    const raw = fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");
    const json = JSON.parse(raw);
    const items = Array.isArray(json?.data)
      ? json.data
      : Array.isArray(json)
        ? json
        : [];
    return { file, items };
  }

  // ---------- DB helpers ----------
  async getFixtureIdByApiFixtureId(api_fixture_id) {
    const r = await this.Model(this.fixturesTable)
      .select("fixture_id")
      .where("api_fixture_id", api_fixture_id)
      .first();
    return r?.fixture_id || null;
  }

  // Map API team -> teamsInfo.team_id
  async resolveTeamId(apiTeamId) {
    if (!apiTeamId) return null;
    let row = await this.Model(this.teamsTable)
      .select("team_id")
      .where("team_id", apiTeamId)
      .first();
    if (row?.team_id) return row.team_id;

    try {
      row = await this.Model(this.teamsTable)
        .select("team_id")
        .where("api_team_id", apiTeamId)
        .first();
      if (row?.team_id) return row.team_id;
    } catch (_) {}

    try {
      row = await this.Model(this.teamsTable)
        .select("team_id")
        .where("api_id", apiTeamId)
        .first();
      if (row?.team_id) return row.team_id;
    } catch (_) {}

    return null;
  }

  // Map API coach -> coaches.coach_id
  async resolveCoachId(apiCoachId) {
    if (!apiCoachId) return null;
    let row = await this.Model(this.coachesTable)
      .select("coach_id")
      .where("coach_id", apiCoachId)
      .first();
    if (row?.coach_id) return row.coach_id;

    try {
      row = await this.Model(this.coachesTable)
        .select("coach_id")
        .where("api_coach_id", apiCoachId)
        .first();
      if (row?.coach_id) return row.coach_id;
    } catch (_) {}

    try {
      row = await this.Model(this.coachesTable)
        .select("coach_id")
        .where("api_id", apiCoachId)
        .first();
      if (row?.coach_id) return row.coach_id;
    } catch (_) {}

    return null;
  }

  // Map API player -> playersProfiles.player_id
  async resolvePlayerId(apiPlayerId) {
    if (!apiPlayerId) return null;
    let row = await this.Model(this.playersProf)
      .select("player_id")
      .where("player_id", apiPlayerId)
      .first();
    if (row?.player_id) return row.player_id;

    try {
      row = await this.Model(this.playersProf)
        .select("player_id")
        .where("api_player_id", apiPlayerId)
        .first();
      if (row?.player_id) return row.player_id;
    } catch (_) {}

    try {
      row = await this.Model(this.playersProf)
        .select("player_id")
        .where("api_id", apiPlayerId)
        .first();
      if (row?.player_id) return row.player_id;
    } catch (_) {}

    return null;
  }

  toParentRow({ fixture_id, api_fixture_id, team_id, lineup, coach_id }) {
    const coach = lineup?.coach || {};
    const colors = lineup?.team?.colors || {};
    const p = colors.player || {};
    const gk = colors.goalkeeper || {};

    return {
      fixture_id,
      api_fixture_id,
      team_id,
      coach_id: coach_id ?? null, // resolved DB id or NULL (avoid FK errors)
      coach_name: coach.name || null,
      coach_photo: coach.photo || null,
      formation: lineup?.formation || null,
      color_player_primary: p.primary || null,
      color_player_number: p.number || null,
      color_player_border: p.border || null,
      color_gk_primary: gk.primary || null,
      color_gk_number: gk.number || null,
      color_gk_border: gk.border || null,
    };
  }

  // Build player rows with resolved player_id FK (or NULL when not found)
  async toPlayerRowsAsync({ lineup_id, arr, isStarting }) {
    if (!Array.isArray(arr) || !arr.length) return [];
    const rows = [];
    for (const it of arr) {
      const pl = it?.player || {};
      const player_id = await this.resolvePlayerId(pl.id); // may be NULL → allowed by FK
      rows.push({
        lineup_id,
        player_id: player_id, // NULL if not found (FK allows SET NULL)
        player_name: pl.name || "Unknown", // NOT NULL
        number: typeof pl.number === "number" ? pl.number : null,
        pos: pl.pos || null,
        grid: pl.grid || null,
        is_starting: !!isStarting,
      });
    }
    return rows;
  }

  // Safe UPSERT without .onDuplicateUpdate (works across Knex versions)
  async upsertParent(row, trx) {
    const where = { fixture_id: row.fixture_id, team_id: row.team_id };

    const existing = await this.Model(this.table)
      .transacting(trx)
      .select("lineup_id")
      .where(where)
      .first();

    if (existing?.lineup_id) {
      await this.Model(this.table).transacting(trx).where(where).update({
        coach_id: row.coach_id,
        coach_name: row.coach_name,
        coach_photo: row.coach_photo,
        formation: row.formation,
        color_player_primary: row.color_player_primary,
        color_player_number: row.color_player_number,
        color_player_border: row.color_player_border,
        color_gk_primary: row.color_gk_primary,
        color_gk_number: row.color_gk_number,
        color_gk_border: row.color_gk_border,
      });
      return existing.lineup_id;
    }

    await this.Model(this.table).transacting(trx).insert(row);

    const inserted = await this.Model(this.table)
      .transacting(trx)
      .select("lineup_id")
      .where(where)
      .first();

    return inserted?.lineup_id || null;
  }

  async replacePlayers(lineup_id, rows, trx) {
    await this.Model(this.playersTable)
      .transacting(trx)
      .where({ lineup_id })
      .del();
    if (rows.length) {
      await this.Model(this.playersTable).transacting(trx).insert(rows);
    }
    return rows.length;
  }

  // ---------- Import ----------
  async fetchFromApi() {
    const { file, items } = this.readItems();

    let parentUpserts = 0;
    let playersWritten = 0;
    let empty = 0;
    let missingFixture = 0;
    let missingTeam = 0;
    let failed = 0;
    const sampleErrors = [];

    for (const item of items) {
      const api_fixture_id = item?.fixture_id;
      const lineupsArr = Array.isArray(item?.lineups) ? item.lineups : [];
      if (!api_fixture_id || !lineupsArr.length) {
        empty++;
        continue;
      }

      const fixture_id = await this.getFixtureIdByApiFixtureId(api_fixture_id);
      if (!fixture_id) {
        missingFixture++;
        continue;
      }

      await this.Model.transaction(async (trx) => {
        for (const lineup of lineupsArr) {
          try {
            // Resolve FKs
            const apiTeamId = lineup?.team?.id;
            const team_id = await this.resolveTeamId(apiTeamId);
            if (!team_id) {
              missingTeam++;
              continue;
            }

            const coach_id = await this.resolveCoachId(lineup?.coach?.id);

            // Upsert parent
            const parentRow = this.toParentRow({
              fixture_id,
              api_fixture_id,
              team_id,
              lineup,
              coach_id,
            });
            const lineup_id = await this.upsertParent(parentRow, trx);

            // Replace players (resolve FK per player)
            const start = await this.toPlayerRowsAsync({
              lineup_id,
              arr: lineup?.startXI,
              isStarting: true,
            });
            const subs = await this.toPlayerRowsAsync({
              lineup_id,
              arr: lineup?.substitutes,
              isStarting: false,
            });
            const wrote = await this.replacePlayers(
              lineup_id,
              [...start, ...subs],
              trx
            );

            parentUpserts += 1;
            playersWritten += wrote;
          } catch (e) {
            failed++;
            if (sampleErrors.length < 5) {
              sampleErrors.push(e?.sqlMessage || e?.message || String(e));
            }
          }
        }
      });
    }

    return {
      file: path.relative(process.cwd(), file),
      total_items: items.length,
      inserted_or_updated: parentUpserts,
      players_written: playersWritten,
      empty,
      missing_fixture: missingFixture,
      missing_team: missingTeam,
      failed,
      sample_errors: sampleErrors,
    };
  }
}

module.exports = { FixturesLineupsService };
