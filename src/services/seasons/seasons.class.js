// src/services/seasons/seasons.class.js
const axios = require("axios");

class SeasonsService {
  constructor(options) {
    this.options = options;
    this.Model = options.Model;
    this.table = options.name;
    this.id = options.id;
  }

  // Standard CRUD
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

  // 🔹 Custom method: fetch from API-Football
  async fetchFromApi() {
    const { API_KEY } = process.env;
    if (!API_KEY) throw new Error("API_KEY is not set");

    const { data } = await axios.get(
      "https://v3.football.api-sports.io/leagues/seasons",
      {
        headers: {
          "x-apisports-key": API_KEY,
        },
      }
    );

    const items = Array.isArray(data?.response) ? data.response : [];
    let created = 0,
      updated = 0;

    for (const year of items) {
      if (!year) continue;

      const existing = await this.Model(this.table).where({ year }).first();

      if (existing) {
        updated++;
      } else {
        await this.Model(this.table).insert({ year });
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

module.exports = { SeasonsService };
