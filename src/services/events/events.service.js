// Registration identical in spirit to fixturesStats.service.js
const hooks = require("./hooks");
const { EventsService } = require("./events.class");

module.exports = function (app) {
  const knex = app.get("knex");

  const service = new EventsService({
    Model: knex,
    name: "events",
    id: "event_id",
    file: require("path").resolve(
      process.cwd(),
      "files",
      "events",
      "2025.json"
    ),
  });

  app.use("/api/v1/events", service);
  app.service("/api/v1/events").hooks(hooks);

  // Optional helper endpoint — same idea as other services
  app.get("/api/v1/events/refresh", async (req, res, next) => {
    try {
      const result = await service.fetchFromApi();
      res.json({ ok: true, ...result });
    } catch (e) {
      next(e);
    }
  });

  // Auto-import on boot (like fixturesStats)
  (async () => {
    try {
      const result = await service.fetchFromApi();
      console.log("[events] Auto-import completed:", result);
    } catch (e) {
      console.log("[events] Auto-import failed:", e.message);
    }
  })();
};
