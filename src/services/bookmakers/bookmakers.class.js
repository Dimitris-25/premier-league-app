// Class for Bookmakers: standard CRUD + fetchFromApi (API-Football)

const axios = require("axios");

class Bookmakers {
  constructor(options) {
    this.options = options;
    this.Model = options.Model; // Knex instance
    this.table = options.name; // "bookmakers"
    this.id = options.id; // "bookmaker_id"
  }

  // Standard CRUD (Feathers calls these)
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

  // -------- Custom: Fetch bookmakers from API-Football --------
  async fetchFromApi() {
    const { API_KEY } = process.env;
    if (!API_KEY) throw new Error("API_KEY is not set");

    // Call API-Football: Odds → Bookmakers
    const { data } = await axios.get(
      "https://v3.football.api-sports.io/odds/bookmakers",
      { headers: { "x-apisports-key": API_KEY } }
    );

    const items = Array.isArray(data?.response) ? data.response : [];
    let created = 0;
    let updated = 0;

    // Upsert by api_bookmaker_id
    for (const it of items) {
      const apiBookmakerId = it?.id ?? null;
      const name = (it?.name || "").trim();
      if (!apiBookmakerId || !name) continue;

      const existing = await this.Model(this.table)
        .where({ api_bookmaker_id: apiBookmakerId })
        .first();

      if (existing) {
        await this.Model(this.table)
          .where({ [this.id]: existing[this.id] })
          .update({
            api_bookmaker_id: apiBookmakerId,
            name,
          });
        updated++;
      } else {
        await this.Model(this.table).insert({
          api_bookmaker_id: apiBookmakerId,
          name,
        });
        created++;
      }
    }

    return { ok: true, total: items.length, created, updated };
  }
}

module.exports = { Bookmakers };
