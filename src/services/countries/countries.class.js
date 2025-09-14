// src/services/countries/countries.class.js
const axios = require("axios");

class CountriesService {
  constructor(options) {
    this.options = options;
    this.Model = options.Model;
    this.table = options.name;
    this.id = options.id;
  }

  // Standard CRUD (Feathers καλεί αυτόματα)
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

  // Custom method: fetch from API-Football
  async fetchFromApi() {
    const { API_KEY } = process.env;
    if (!API_KEY) throw new Error("API_KEY is not set");

    const { data } = await axios.get(
      "https://v3.football.api-sports.io/countries",
      {
        headers: { "x-apisports-key": API_KEY },
      }
    );

    const items = Array.isArray(data?.response) ? data.response : [];
    let created = 0,
      updated = 0;

    for (const it of items) {
      const code = it?.code ? String(it.code).trim().slice(0, 10) : null;
      const name = (it?.name || "").trim();
      const flag = it?.flag || null;

      if (!code || !name) continue;

      const existing = await this.Model(this.table).where("code", code).first();

      if (existing) {
        await this.Model(this.table).where("code", code).update({ name, flag });
        updated++;
      } else {
        await this.Model(this.table).insert({ code, name, flag });
        created++;
      }
    }

    return {
      ok: true,
      total: items.length,
      created,
      updated,
    };
  }
}

module.exports = { CountriesService };
