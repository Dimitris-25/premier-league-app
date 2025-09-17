// src/services/venues/venues.service.js
const { VenuesService } = require("./venues.class");
const hooks = require("./hooks");

module.exports = function (app) {
  const knex = app.get("knex");

  const options = {
    // Feathers Knex adapter expects the initialized knex instance
    Model: knex,
    // MySQL table name
    name: "venues",
    // Primary key column
    id: "venue_id",
    // If you want bulk ops later, add: multi: ['create','patch','remove']
  };

  // Keep both forms to avoid confusion: BASE (with slash) for app.use,
  // PATH (no leading slash) for app.service lookups (Feathers canonical form).
  const PATH = "api/v1/venues";
  const BASE = `/${PATH}`;

  // 1) Initialize & mount service
  const service = new VenuesService(options);
  app.use(BASE, service);

  // 2) Attach hooks (use canonical service path without leading slash)
  const venuesService = app.service(PATH);
  venuesService.hooks(hooks);

  // 3) Optional: seed on boot if enabled in config
  const seedVenuesOnBoot = !!app.get("seedVenuesOnBoot");
  if (seedVenuesOnBoot) {
    (async () => {
      try {
        console.log("🏟️ Seeding venues from API-Football…");
        const result = await service.fetchFromApi();
        console.log("✅ Venues sync complete:", result);
      } catch (err) {
        console.error("❌ Failed to fetch venues:", err.message);
      }
    })();
  }

  // 4) Optional manual refresh endpoint: GET /api/v1/venues/refresh
  app.use(`${BASE}/refresh`, {
    async find() {
      return service.fetchFromApi();
    },
  });
};
