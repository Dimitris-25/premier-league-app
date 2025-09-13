const axios = require("axios");
const path = require("path");
const fs = require("fs");

class TeamsInfoService {
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

  // 🔹 Fetch from API-Football (only season 2025)
  async fetchFromApi() {
    const { API_KEY } = process.env;
    if (!API_KEY) throw new Error("API_KEY is not set");

    const { data } = await axios.get(
      "https://v3.football.api-sports.io/teams",
      {
        params: {
          league: 39, // Premier League
          season: 2025, // only 2025
          country: "England", // optional
        },
        headers: { "x-apisports-key": API_KEY },
      }
    );

    return this._upsertTeams(data?.response || [], 2025);
  }

  // 🔹 Load ALL seasons (2015–2024) from JSON
  async fetchFromFileAll() {
    try {
      const filePath = path.join(process.cwd(), "files", "teamsData.json");
      const raw = fs.readFileSync(filePath, "utf-8");

      let json;
      if (raw.trim().startsWith("[")) {
        json = JSON.parse(raw);
      } else {
        json = JSON.parse(`[${raw.replace(/}\s*{/g, "},{")}]`);
      }

      let totalCreated = 0;
      let totalUpdated = 0;

      for (let year = 2015; year <= 2024; year++) {
        const seasonObj = json.find((x) => x.parameters?.season == year);
        if (!seasonObj || !Array.isArray(seasonObj.response)) {
          console.log(`⚠ No data found in file for season ${year}`);
          continue;
        }

        const result = await this._upsertTeams(seasonObj.response, year);
        totalCreated += result.created;
        totalUpdated += result.updated;
      }

      return {
        ok: true,
        seasons: "2015–2024",
        created: totalCreated,
        updated: totalUpdated,
      };
    } catch (err) {
      console.error("❌ Failed to fetch teamsInfo from file:", err.message);
      return { ok: false, error: err.message };
    }
  }

  // 🔹 Common insert/update logic
  async _upsertTeams(items, season) {
    let created = 0,
      updated = 0;

    for (const it of items) {
      const apiTeamId = it.team?.id || null; // ✅ api_team_id (from API)
      const name = (it.team?.name || "").trim();
      const code = it.team?.code || null;
      const founded = it.team?.founded || null;
      const logo = it.team?.logo || null;

      if (!apiTeamId || !name) continue;

      // ---- Country FK (keep lookup by name as you had)
      let countryId = null;
      if (it.team?.country) {
        const country = await this.Model("countries")
          .where({ name: it.team.country })
          .first();
        if (country) countryId = country.country_id;
      }

      // ---- Venue FK (lookup by api_venue_id) ✅
      let venueId = null;
      if (it.venue?.id) {
        const venue = await this.Model("venues")
          .where({ api_venue_id: it.venue.id })
          .first();
        if (venue) venueId = venue.venue_id;
      }

      // ---- Insert / Update by api_team_id ✅
      const existing = await this.Model(this.table)
        .where({ api_team_id: apiTeamId })
        .first();

      const payload = {
        api_team_id: apiTeamId, // ✅ always set
        name,
        code,
        founded,
        logo,
        venue_id: venueId,
        country_id: countryId,
      };

      if (existing) {
        await this.Model(this.table)
          .where({ api_team_id: apiTeamId })
          .update(payload);
        updated++;
      } else {
        // ❌ no team_id here (auto-increment)
        await this.Model(this.table).insert(payload);
        created++;
      }
    }

    return { ok: true, season, total: items.length, created, updated };
  }
}

module.exports = { TeamsInfoService };
