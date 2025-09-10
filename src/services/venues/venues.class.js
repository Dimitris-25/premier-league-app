const axios = require("axios");

class VenuesService {
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

  // 🔹 Custom method: fetch from API-Football
  async fetchFromApi() {
    const { API_KEY } = process.env;
    if (!API_KEY) throw new Error("API_KEY is not set");

    const { data } = await axios.get(
      "https://v3.football.api-sports.io/venues",
      {
        params: {
          country: "England", // ✅ μπορούμε να φιλτράρουμε ανά χώρα
        },
        headers: {
          "x-apisports-key": API_KEY,
        },
      }
    );

    const items = Array.isArray(data?.response) ? data.response : [];
    let created = 0,
      updated = 0;

    for (const it of items) {
      const apiVenueId = it.id || null;
      const name = (it.name || "").trim();
      const address = it.address || null;
      const cityName = it.city || null;
      const capacity = it.capacity || null;
      const surface = it.surface || null;
      const image = it.image || null;

      if (!apiVenueId || !name) continue;

      // ---- Country lookup (FK)
      let countryId = null;
      if (it.country) {
        const country = await this.Model("countries")
          .where({ name: it.country })
          .first();
        if (country) countryId = country.country_id;
      }

      // ---- City lookup (FK)
      let cityId = null;
      if (cityName) {
        const existingCity = await this.Model("cities")
          .where({ name: cityName, country_id: countryId })
          .first();
        if (existingCity) {
          cityId = existingCity.city_id;
        } else {
          const [newCityId] = await this.Model("cities").insert({
            name: cityName,
            country_id: countryId,
          });
          cityId = newCityId;
        }
      }

      // ---- Insert / Update venue
      const existing = await this.Model(this.table)
        .where({ api_venue_id: apiVenueId })
        .first();

      if (existing) {
        await this.Model(this.table)
          .where({ venue_id: existing.venue_id })
          .update({
            api_venue_id: apiVenueId,
            name,
            address,
            capacity,
            surface,
            image,
            city_id: cityId,
            country_id: countryId,
          });
        updated++;
      } else {
        await this.Model(this.table).insert({
          api_venue_id: apiVenueId,
          name,
          address,
          capacity,
          surface,
          image,
          city_id: cityId,
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

module.exports = { VenuesService };
