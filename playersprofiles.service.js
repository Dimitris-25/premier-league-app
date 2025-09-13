// src/services/playersProfiles/playersProfiles.service.js
const { PlayersProfiles } = require("./playersProfiles.class");
const hooks = require("./hooks");

module.exports = function (app) {
  const knex = app.get("knex");

  const options = {
    // Feathers Knex adapter expects `Model` to be the initialized knex instance
    Model: knex,
    // MySQL table name
    name: "playersProfiles",
    // Primary key column
    id: "player_id",
    // multi: ['create', 'patch', 'remove'] // (optional, same style as others)
  };

  // Initialize service
  const service = new PlayersProfiles(options);
  app.use("/playersProfiles", service);

  // Register hooks
  const playersProfilesService = app.service("playersProfiles");
  playersProfilesService.hooks(hooks);

  // 🔹 Run fetch automatically at startup (reads files/players/2025.json)
  (async () => {
    try {
      console.log(
        "👤 Importing playersProfiles from files/players/2025.json..."
      );
      const result = await service.fetchFromApi();
      console.log("✅ PlayersProfiles import complete:", result);
    } catch (err) {
      console.error("❌ Failed to import playersProfiles:", err.message);
    }
  })();

  // 🔹 Add custom endpoint /playersProfiles/refresh
  app.use("/playersProfiles/refresh", {
    async find() {
      return service.fetchFromApi();
    },
  });
};
