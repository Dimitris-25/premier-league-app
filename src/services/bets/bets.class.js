// Class for Bets: standard CRUD + fetchFromApi + fetchOddsFromApi + fetchAllFromApi
const axios = require("axios");

class Bets {
  constructor(options) {
    this.options = options;
    this.Model = options.Model; // Knex instance
    this.table = options.name; // "bets"
    this.id = options.id; // "bet_id"
  }

  // -------- Standard CRUD --------
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

  // -------- Fetch bet markets (odds/bets) --------
  async fetchFromApi() {
    const { API_KEY } = process.env;
    if (!API_KEY) throw new Error("API_KEY is not set");

    const { data } = await axios.get(
      "https://v3.football.api-sports.io/odds/bets",
      { headers: { "x-apisports-key": API_KEY } }
    );

    const items = Array.isArray(data?.response) ? data.response : [];
    let created = 0,
      updated = 0;

    for (const it of items) {
      const apiBetId = it?.id ?? null;
      const name = (it?.name || "").trim();
      if (!apiBetId || !name) continue;

      const existing = await this.Model(this.table)
        .where({ api_bet_id: apiBetId })
        .first();

      if (existing) {
        await this.Model(this.table)
          .where({ [this.id]: existing[this.id] })
          .update({ api_bet_id: apiBetId, name });
        updated++;
      } else {
        await this.Model(this.table).insert({ api_bet_id: apiBetId, name });
        created++;
      }
    }

    return { ok: true, total: items.length, created, updated };
  }

  // -------- Fetch odds for 2025 season --------
  async fetchOddsFromApi() {
    const { API_KEY } = process.env;
    if (!API_KEY) throw new Error("API_KEY is not set");

    // Example: Premier League (league=39) season 2025
    const { data } = await axios.get("https://v3.football.api-sports.io/odds", {
      params: { league: 39, season: 2025 },
      headers: { "x-apisports-key": API_KEY },
    });

    return {
      ok: true,
      total: Array.isArray(data?.response) ? data.response.length : 0,
    };
  }

  // -------- Run both in sequence --------
  async fetchAllFromApi() {
    const bets = await this.fetchFromApi();
    const odds = await this.fetchOddsFromApi();
    return { bets, odds };
  }
}

module.exports = { Bets };
