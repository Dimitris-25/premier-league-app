// src/services/venues/venues.class.js
const axios = require("axios");

class VenuesService {
  constructor(options) {
    this.options = options;
    this.Model = options.Model;
    this.table = options.name;
    this.id = options.id;
  }

  // ---------- Standard CRUD ----------
  async find(params) {
    return this.Model(this.table).select("*");
  }

  async get(id, params) {
    return this.Model(this.table).where(this.id, id).first();
  }

  async create(data, params) {
    console.log("VENUES.CREATE received data =>", data);
    // NOTE: MySQL returns the inserted PK id in the first array slot
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

  // ---------- Custom: Fetch from API-Football (idempotent upsert) ----------
  async fetchFromApi() {
    const { API_KEY } = process.env;
    if (!API_KEY) throw new Error("API_KEY is not set");

    let created = 0,
      updated = 0,
      skipped = 0,
      total = 0;

    try {
      const { data } = await axios.get(
        "https://v3.football.api-sports.io/venues",
        {
          params: { country: "England" },
          headers: { "x-apisports-key": API_KEY },
        }
      );

      const items = Array.isArray(data?.response) ? data.response : [];
      total = items.length;

      for (const it of items) {
        // --- Normalize input ---
        const apiVenueId = it?.id ?? null;
        const name = (it?.name || "").trim();
        const address = it?.address ?? null;
        const cityName = it?.city ?? null;
        const capacity = it?.capacity ?? null;
        const surface = it?.surface ?? null;
        const image = it?.image ?? null;

        if (!apiVenueId || !name) {
          skipped++;
          continue;
        }

        // --- Country FK lookup ---
        let countryId = null;
        if (it?.country) {
          const country = await this.Model("countries")
            .where({ name: it.country })
            .first();
          if (country) countryId = country.country_id;
        }

        // --- City FK lookup (create if missing) ---
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

        // --- Row to upsert ---
        const row = {
          api_venue_id: apiVenueId,
          name,
          address,
          capacity,
          surface,
          image,
          city_id: cityId,
          country_id: countryId,
        };

        // 1) Update by api_venue_id if exists
        const byApi = await this.Model(this.table)
          .where({ api_venue_id: apiVenueId })
          .first();

        if (byApi) {
          await this.Model(this.table)
            .where({ venue_id: byApi.venue_id })
            .update(row);
          updated++;
          continue;
        }

        // 2) Otherwise, try tuple (name, city_id, country_id)
        const byTuple = await this.Model(this.table)
          .where({ name, city_id: cityId, country_id: countryId })
          .first();

        if (byTuple) {
          await this.Model(this.table)
            .where({ venue_id: byTuple.venue_id })
            .update(row);
          updated++;
          continue;
        }

        // 3) Insert new
        await this.Model(this.table).insert(row);
        created++;
      }

      return { ok: true, total, created, updated, skipped };
    } catch (err) {
      return {
        ok: false,
        total,
        created,
        updated,
        skipped,
        error: err?.message || String(err),
      };
    }
  }
}

module.exports = { VenuesService };
