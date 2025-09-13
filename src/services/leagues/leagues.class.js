const axios = require("axios");

class LeaguesService {
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
      "https://v3.football.api-sports.io/leagues",
      {
        params: { name: "Premier League" }, // ✅ μόνο αυτό κρατάμε
        headers: { "x-apisports-key": API_KEY },
      }
    );

    const items = Array.isArray(data?.response) ? data.response : [];
    let created = 0,
      updated = 0;

    for (const it of items) {
      const apiLeagueId = it.league?.id || null;
      const name = (it.league?.name || "").trim();
      const type = it.league?.type || null;
      const logo = it.league?.logo || null;
      if (!apiLeagueId || !name) continue;

      // ---- Country lookup (FK)
      let countryId = null;
      if (it.country?.code) {
        const country = await this.Model("countries")
          .where({ code: it.country.code })
          .first();
        if (country) countryId = country.country_id;
      }

      // ---- Season lookup (FK)  ✅ διορθωμένο
      let seasonId = null;
      if (Array.isArray(it.seasons) && it.seasons.length > 0) {
        // πάρε προτεραιότητα το current, αλλιώς το πιο πρόσφατο year
        const seasonsArr = it.seasons;
        const s =
          seasonsArr.find((x) => x?.current) ||
          seasonsArr.slice().sort((a, b) => (b?.year ?? 0) - (a?.year ?? 0))[0];

        if (s && Number.isInteger(s.year)) {
          const season = await this.Model("seasons")
            .where({ season_year: s.year }) // 🔸 season_year
            .first();

          if (season) {
            seasonId = season.season_id;
          } else {
            const [newId] = await this.Model("seasons").insert({
              season_year: s.year, // 🔸 season_year
              start: s.start ?? null,
              end: s.end ?? null,
              current: s.current ? 1 : 0,
            });
            seasonId = newId;
          }
        }
      }

      // ---- Insert / Update league (γράφουμε season_id)
      const existing = await this.Model(this.table)
        .where({ api_league_id: apiLeagueId })
        .first();

      if (existing) {
        await this.Model(this.table)
          .where({ league_id: existing.league_id })
          .update({
            api_league_id: apiLeagueId,
            name,
            type,
            logo,
            country_id: countryId,
            season_id: seasonId, // ✅
          });
        updated++;
      } else {
        await this.Model(this.table).insert({
          api_league_id: apiLeagueId,
          name,
          type,
          logo,
          country_id: countryId,
          season_id: seasonId, // ✅
        });
        created++;
      }
    }

    return { ok: true, total: items.length, created, updated };
  }
}

module.exports = { LeaguesService };
