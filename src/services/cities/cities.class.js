const axios = require("axios");

class CitiesService {
  constructor(options) {
    this.options = options;
    this.Model = options.Model;
    this.table = options.name;
    this.id = options.id;
  }

  // Standard CRUD (Feathers auto call)
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

  // 🔹 Custom method: fetch cities from API-Football
  // Note: There is no dedicated endpoint for cities,
  // so we derive them from venues data.
  async fetchFromApi() {
    const { API_KEY } = process.env;
    if (!API_KEY) throw new Error("API_KEY is not set");

    // Example: fetch venues from API-Football
    const { data } = await axios.get(
      "https://v3.football.api-sports.io/venues",
      {
        params: { country: "England" }, // optional filter
        headers: { "x-apisports-key": API_KEY },
      }
    );

    const items = Array.isArray(data?.response) ? data.response : [];
    let created = 0,
      updated = 0;

    for (const it of items) {
      const cityName = it.city || null;
      if (!cityName) continue;

      // ---- Country lookup (FK)
      let countryId = null;
      if (it.country) {
        const country = await this.Model("countries")
          .where({ name: it.country })
          .first();
        if (country) countryId = country.country_id;
      }

      // ---- Insert or Update city
      const existing = await this.Model(this.table)
        .where({ name: cityName, country_id: countryId })
        .first();

      if (existing) {
        await this.Model(this.table)
          .where({ city_id: existing.city_id })
          .update({ name: cityName, country_id: countryId });
        updated++;
      } else {
        await this.Model(this.table).insert({
          name: cityName,
          country_id: countryId,
        });
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

module.exports = { CitiesService };
