// src/services/coaches/coaches.class.js
// Feathers + Knex service for importing coaches from a local JSON file.

const fs = require("fs");
const path = require("path");

class CoachesService {
  constructor(options) {
    this.options = options;
    this.Model = options.Model; // knex instance
    this.table = options.name; // "coaches"
    this.id = options.id || "coach_id";
  }

  //  Standard CRUD
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

  async importFromFile(
    fileRelPath = path.join("files", "teams", "coaches_2025.json")
  ) {
    const filePath = path.isAbsolute(fileRelPath)
      ? fileRelPath
      : path.join(process.cwd(), fileRelPath);

    if (!fs.existsSync(filePath))
      throw new Error(`Coaches file not found: ${filePath}`);

    const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const items = Array.isArray(raw?.response) ? raw.response : [];

    let created = 0,
      updated = 0,
      scanned = 0;

    await this.Model.transaction(async (trx) => {
      for (const row of items) {
        const apiTeamId = Number(row?.team_id) || null;
        const arr = Array.isArray(row?.body?.response) ? row.body.response : [];
        if (!arr.length) continue;

        // Some responses may include multiple entries; import them all (upsert by api_coach_id)
        for (const c of arr) {
          scanned++;

          const apiCoachId = Number(c?.id) || null;
          if (!apiCoachId) continue;

          // Resolve FK team_id from teamsInfo by api_team_id
          let teamId = null;
          const teamApi = Number(c?.team?.id || apiTeamId) || null;
          if (teamApi) {
            const tRow = await trx("teamsInfo")
              .where({ api_team_id: teamApi })
              .first();
            if (tRow) teamId = tRow.team_id;
          }

          const birth = c?.birth || {};
          const record = {
            api_coach_id: apiCoachId,
            name: (c?.name || "").trim(),
            firstname: c?.firstname || null,
            lastname: c?.lastname || null,
            age: this.#toInt(c?.age),
            birth_date: this.#toDate(birth?.date),
            birth_place: birth?.place || null,
            birth_country: birth?.country || null,
            nationality: c?.nationality || null,
            height: c?.height || null,
            weight: c?.weight || null,
            photo: c?.photo || null,

            team_id: teamId,
            api_team_id: teamApi || null,
          };

          // Upsert by unique api_coach_id
          const existing = await trx(this.table)
            .where({ api_coach_id: record.api_coach_id })
            .first();

          if (existing) {
            await trx(this.table)
              .where({ coach_id: existing.coach_id })
              .update(record);
            updated++;
          } else {
            await trx(this.table).insert(record);
            created++;
          }
        }
      }
    });

    return { ok: true, scanned, created, updated };
  }

  //  Helpers
  #toInt(v) {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : null;
  }
  // Accepts 'YYYY-MM-DD' and returns the same (MySQL DATE), else null
  #toDate(v) {
    if (!v || typeof v !== "string") return null;
    // naive validation
    return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
  }
}

module.exports = { CoachesService };
