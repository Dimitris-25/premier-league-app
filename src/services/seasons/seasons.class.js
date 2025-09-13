// src/services/seasons/seasons.class.js
const axios = require("axios");

class SeasonsService {
  constructor(options) {
    this.options = options;
    this.Model = options.Model;
    this.table = options.name;
    this.id = options.id;
  }

  // ─────────────────────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────────────
  // Helpers

  /**
   * Build API-Football headers with API key from env.
   * Throws if API_KEY is missing so we fail fast.
   */
  getApiHeaders() {
    const { API_KEY } = process.env;
    if (!API_KEY) throw new Error("API_KEY is not set");
    return { headers: { "x-apisports-key": API_KEY } };
  }

  /**
   * Fetch a JSON array safely (returns [] on unexpected shapes).
   */
  static safeArray(res) {
    return Array.isArray(res?.data?.response) ? res.data.response : [];
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Custom method: fetch all available seasons (years) and upsert to DB
  async fetchFromApi() {
    // GET /leagues/seasons → [2008, 2009, ..., 2025]
    const res = await axios.get(
      "https://v3.football.api-sports.io/leagues/seasons",
      this.getApiHeaders()
    );

    const years = SeasonsService.safeArray(res);
    let created = 0,
      skipped = 0;

    for (const year of years) {
      if (!year) continue;

      // Upsert by unique year
      const existing = await this.Model(this.table)
        .where({ season_year: year })
        .first();

      await this.Model(this.table).insert({ season_year: year });
    }

    return {
      ok: true,
      total: years.length,
      created,
      skipped,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Scenario: Resolve previous season for a player automatically
  /**
   * Resolve a season for a given player based on a "mode".
   *
   * @param {Object} opts
   * @param {number} opts.playerId - API-Football player id.
   * @param {"previous"|"latest"} [opts.mode="previous"]
   *   - "previous": returns the season just before `relativeTo` (or latest if not provided).
   *   - "latest": returns the latest available season for the player.
   * @param {number} [opts.relativeTo] - Reference season (e.g., 2025). If omitted,
   *   we compute relative to the player's latest season.
   *
   * @returns {Promise<{season:number|null, seasons:number[]}>}
   *
   * Behavior:
   * - Calls GET /players/seasons?player={playerId}
   * - Sorts seasons DESC.
   * - If mode="previous":
   *     - If relativeTo is given → pick the largest season < relativeTo.
   *     - Else → compute previous of the player's latest (index 1).
   * - If not found → returns { season: null } for the caller to handle (422/404).
   */
  async resolveSeasonForPlayer({
    playerId,
    mode = "previous",
    relativeTo,
  } = {}) {
    if (!playerId) throw new Error("playerId is required");

    const res = await axios.get(
      `https://v3.football.api-sports.io/players/seasons`,
      {
        ...this.getApiHeaders(),
        params: { player: Number(playerId) },
      }
    );

    const seasons = SeasonsService.safeArray(res)
      .filter((y) => Number.isInteger(y))
      .sort((a, b) => b - a); // DESC

    if (seasons.length === 0) {
      return { season: null, seasons: [] };
    }

    if (mode === "latest") {
      return { season: seasons[0], seasons };
    }

    // mode === "previous"
    const ref = Number.isInteger(relativeTo) ? relativeTo : seasons[0];
    const prev = seasons.find((y) => y < ref) ?? null;
    return { season: prev, seasons };
  }
}

module.exports = { SeasonsService };
