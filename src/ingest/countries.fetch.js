const axios = require("axios");
const logger = require("../logger");

module.exports = function registerCountriesFetch(app) {
  logger.info("Registering /countries/fetch"); // startup log

  const service = app.service("countries");

  app.get("/countries/fetch", async (req, res, next) => {
    try {
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
        const name = (it?.name || "").trim();
        const code = it?.code ? String(it.code).trim().slice(0, 10) : null;
        const flag = it?.flag || null;
        if (!name) continue;

        const existing = await service.find({ query: { name, $limit: 1 } });
        const row = existing?.data?.[0];
        if (row) {
          await service.patch(row.country_id, { code, flag });
          updated++;
        } else {
          await service.create({ name, code, flag });
          created++;
        }
      }

      logger.info(`Countries ingest: created=${created}, updated=${updated}`);
      res.json({ ok: true, total: items.length, created, updated });
    } catch (err) {
      logger.error(`Countries ingest failed: ${err.message}`);
      next(err);
    }
  });
};
