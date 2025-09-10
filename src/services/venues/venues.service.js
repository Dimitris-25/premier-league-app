// src/services/venues/venues.service.js
const { VenuesService } = require("./venues.class");
const hooks = require("./hooks");

module.exports = function (app) {
  const knex = app.get("knex");

  const options = {
    // Feathers Knex adapter expects `Model` to be the initialized knex instance
    Model: knex,
    // MySQL table name
    name: "venues",
    // Primary key column
    id: "venue_id",
    // multi: ['create', 'patch', 'remove'] // (optional, keep same style as countries)
  };

  // Initialize service
  const service = new VenuesService(options);
  app.use("/venues", service);

  // Register hooks
  const venuesService = app.service("venues");
  venuesService.hooks(hooks);

  // 🔹 Run fetch automatically at startup
  (async () => {
    try {
      console.log("🏟️ Fetching venues from API-Football...");
      const result = await service.fetchFromApi();
      console.log("✅ Venues sync complete:", result);
    } catch (err) {
      console.error("❌ Failed to fetch venues:", err.message);
    }
  })();

  // 🔹 Add custom endpoint /venues/refresh
  app.use("/venues/refresh", {
    async find() {
      return service.fetchFromApi();
    },
  });
};
