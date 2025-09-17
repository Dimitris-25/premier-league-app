// src/services/odds/odds.class.js
// Import pre-match odds from API-Football (/odds?league=39&season=2025)
// Upsert key: (fixture_id, league_id, bookmaker_id, bet_id, value)

const axios = require("axios");

class OddsService {
  constructor(options) {
    this.options = options || {};
    this.Model = this.options.Model;
    this.table = this.options.name || "odds";
    this.id = this.options.id || "odd_id";

    // FK tables (lowercase in your DB)
    this.fixturesTable = this.options.fixturesTable || "fixtures";
    this.leaguesTable = this.options.leaguesTable || "leagues";
    this.bookmakersTable = this.options.bookmakersTable || "bookmakers";
  }

  // ---------- CRUD ----------
  // Safe & fast find with limit/sort and basic filters
  async find(params = {}) {
    const q = params.query || {};
    const limit = Math.min(parseInt(q.$limit, 10) || 50, 200); // default 50, cap 200

    // Optional sort: ?$sort[odd]=desc or ?$sort[odd]=asc
    const sort = q.$sort || {};
    const sortField = Object.keys(sort)[0] || this.id;
    const sortDir =
      sort[sortField] === -1 || String(sort[sortField]).toLowerCase() === "desc"
        ? "desc"
        : "asc";

    // Filters
    const where = {};
    if (q.fixture_id) where.fixture_id = +q.fixture_id;
    if (q.league_id) where.league_id = +q.league_id;
    if (q.bookmaker_id) where.bookmaker_id = +q.bookmaker_id;
    if (q.bet_id) where.bet_id = +q.bet_id;
    // value exact match (key of the composite). For partial search use ?value_like=...
    if (q.value) where.value = String(q.value);
    const valueLike = q.value_like ? String(q.value_like) : null;

    console.log("[ODDS] find() query:", {
      where,
      valueLike,
      limit,
      sortField,
      sortDir,
    });

    try {
      const knexQ = this.Model(this.table).select("*");

      if (Object.keys(where).length) knexQ.where(where);
      if (valueLike) knexQ.andWhere("value", "like", `%${valueLike}%`);

      const rows = await knexQ.orderBy(sortField, sortDir).limit(limit);

      console.log("[ODDS] find() returning rows:", rows.length);
      return rows;
    } catch (err) {
      console.error("[ODDS] find() error:", err.message);
      throw new Error("Failed to fetch odds from DB: " + err.message);
    }
  }

  async get(id) {
    return this.Model(this.table).where(this.id, id).first();
  }

  async create(data) {
    const [pk] = await this.Model(this.table).insert(data);
    return { ...data, [this.id]: pk };
  }

  async patch(id, data) {
    await this.Model(this.table).where(this.id, id).update(data);
    return this.get(id);
  }

  async remove(id) {
    await this.Model(this.table).where(this.id, id).del();
    return { id };
  }

  // ---------- Helpers ----------
  toInt(v) {
    return v === null || v === undefined || v === ""
      ? null
      : Number.isFinite(+v)
        ? +v
        : null;
  }

  toNum(v) {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : null;
  }

  async getFixtureIdByApi(api_fixture_id) {
    if (!api_fixture_id) return null;
    const r = await this.Model(this.fixturesTable)
      .select("fixture_id")
      .where("api_fixture_id", api_fixture_id)
      .first();
    return r?.fixture_id ?? null;
  }

  async getLeagueIdByApi(api_league_id) {
    if (!api_league_id) return null;
    const r = await this.Model(this.leaguesTable)
      .select("league_id")
      .where("api_league_id", api_league_id)
      .first();
    return r?.league_id ?? null;
  }

  // Map API bookmaker id -> local bookmaker_id
  async getBookmakerIdByApi(api_bookmaker_id) {
    if (!api_bookmaker_id) return null;
    const r = await this.Model(this.bookmakersTable)
      .select("bookmaker_id")
      .where("api_bookmaker_id", api_bookmaker_id)
      .first();
    return r?.bookmaker_id ?? null;
  }

  buildRow({
    fixture_id,
    league_id,
    bookmaker_id,
    bookmaker_name,
    bet,
    val,
    updateISO,
  }) {
    return {
      fixture_id,
      league_id,
      bookmaker_id, // local id if found, else API id
      bookmaker_name: (bookmaker_name || "").trim(),
      bet_id: this.toInt(bet?.id), // API bet id
      bet_name: (bet?.name || "").trim(),
      value: String(val?.value ?? "").substring(0, 50),
      odd: this.toNum(val?.odd),
      update_date: updateISO ? new Date(updateISO) : null,
    };
  }

  async upsert(row, trx) {
    const where = {
      fixture_id: row.fixture_id,
      league_id: row.league_id,
      bookmaker_id: row.bookmaker_id,
      bet_id: row.bet_id,
      value: row.value,
    };

    const existing = await this.Model(this.table)
      .transacting(trx)
      .select(this.id)
      .where(where)
      .first();

    if (existing?.[this.id]) {
      await this.Model(this.table).transacting(trx).where(where).update({
        bookmaker_name: row.bookmaker_name,
        bet_name: row.bet_name,
        odd: row.odd,
        update_date: row.update_date,
      });
      return { action: "updated", id: existing[this.id] };
    }

    const [pk] = await this.Model(this.table).transacting(trx).insert(row);
    return { action: "created", id: pk };
  }

  // ---------- Fetch from API-Football ----------
  async fetchFromApi() {
    const { API_KEY } = process.env;
    if (!API_KEY) throw new Error("API_KEY is not set");

    const league = 39;
    const season = 2025;

    const client = axios.create({
      baseURL: "https://v3.football.api-sports.io",
      headers: { "x-apisports-key": API_KEY },
      timeout: 30000,
    });

    let page = 1;
    let totalPages = 1;
    let created = 0;
    let updated = 0;
    let missed_fk = 0;
    let failed = 0;
    const sample_errors = [];

    console.log(
      `[ODDS] Fetching from API-Football league=${league} season=${season}`
    );

    do {
      const { data } = await client.get("/odds", {
        params: { league, season, page },
      });
      const items = Array.isArray(data?.response) ? data.response : [];
      const paging = data?.paging || {};
      totalPages = this.toInt(paging?.total) || 1;

      console.log(`[ODDS] page ${page}/${totalPages} | items: ${items.length}`);

      await this.Model.transaction(async (trx) => {
        for (const item of items) {
          try {
            const api_fixture_id = this.toInt(item?.fixture?.id);
            const api_league_id = this.toInt(item?.league?.id) || league;
            const fixture_id = await this.getFixtureIdByApi(api_fixture_id);
            const league_id = await this.getLeagueIdByApi(api_league_id);
            const updateISO = item?.update || item?.updated || null;

            if (!fixture_id || !league_id) {
              missed_fk++;
              continue;
            }

            const bookmakers = Array.isArray(item?.bookmakers)
              ? item.bookmakers
              : [];
            for (const bm of bookmakers) {
              const api_bm_id = this.toInt(bm?.id);
              const local_bm_id = await this.getBookmakerIdByApi(api_bm_id);
              const bookmaker_id = local_bm_id ?? api_bm_id; // prefer local id; fallback to API id
              const bookmaker_name = bm?.name;

              const bets = Array.isArray(bm?.bets) ? bm.bets : [];
              for (const bet of bets) {
                const values = Array.isArray(bet?.values) ? bet.values : [];
                for (const val of values) {
                  const row = this.buildRow({
                    fixture_id,
                    league_id,
                    bookmaker_id,
                    bookmaker_name,
                    bet,
                    val,
                    updateISO,
                  });
                  if (row.odd === null) continue; // odd column is NOT NULL
                  const { action } = await this.upsert(row, trx);
                  if (action === "created") created++;
                  else updated++;
                }
              }
            }
          } catch (e) {
            failed++;
            if (sample_errors.length < 5) {
              sample_errors.push(e?.sqlMessage || e?.message || String(e));
            }
          }
        }
      });

      page++;
    } while (page <= totalPages);

    const result = {
      ok: true,
      params: { league, season },
      pages: totalPages,
      created,
      updated,
      missed_fk,
      failed,
      sample_errors,
    };
    console.log("[ODDS] Sync complete:", result);
    return result;
  }
}

module.exports = { OddsService };
