// src/services/cities/cities.service.js
const { CitiesService } = require("./cities.class");
const hooks = require("./hooks");

module.exports = function (app) {
  const knex = app.get("knex");

  const options = {
    // Feathers Knex adapter expects `Model` to be the initialized knex instance
    Model: knex,
    // MySQL table name
    name: "cities",
    // Primary key column
    id: "city_id",
    // multi: ['create', 'patch', 'remove'] // (optional, keep consistent style)
  };

  // Initialize service
  const service = new CitiesService(options);
  app.use("/cities", service);

  // Register hooks
  const citiesService = app.service("cities");
  citiesService.hooks(hooks);

  // 🔹 Run fetch automatically at startup
  (async () => {
    try {
      console.log("🏙️ Fetching cities from API-Football...");
      const result = await service.fetchFromApi();
      console.log("✅ Cities sync complete:", result);
    } catch (err) {
      console.error("❌ Failed to fetch cities:", err.message);
    }
  })();

  // 🔹 Add custom endpoint /cities/refresh
  app.use("/cities/refresh", {
    async find() {
      return service.fetchFromApi();
    },
  });
};
