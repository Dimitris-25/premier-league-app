// src/services/bookmakers/bookmakers.service.js
const { Bookmakers } = require("./bookmakers.class");
const hooks = require("./hooks.js");

module.exports = function (app) {
  const knex = app.get("knex");

  const options = {
    // Feathers Knex adapter expects `Model` to be the initialized knex instance
    Model: knex,
    // MySQL table name
    name: "bookmakers",
    // Primary key column
    id: "bookmaker_id",
    // multi: ['create', 'patch', 'remove'] // (optional, keep same style as countries)
  };

  // Initialize service
  const service = new Bookmakers(options);
  app.use("/bookmakers", service);

  // Register hooks
  const bookmakersService = app.service("bookmakers");
  bookmakersService.hooks(hooks);

  // 🔹 Run fetch automatically at startup
  (async () => {
    try {
      console.log("🎲 Fetching bookmakers from API-Football...");
      const result = await service.fetchFromApi();
      console.log("✅ Bookmakers sync complete:", result);
    } catch (err) {
      console.error("❌ Failed to fetch bookmakers:", err.message);
    }
  })();

  // 🔹 Add custom endpoint /bookmakers/refresh
  app.use("/bookmakers/refresh", {
    async find() {
      return service.fetchFromApi();
    },
  });
};
