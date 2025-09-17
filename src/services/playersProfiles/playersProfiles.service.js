// src/services/playersProfiles/playersProfiles.service.js
// PlayersProfiles service — /api/v1/players-profiles, kebab-case, consistent

const { PlayersProfiles } = require("./playersProfiles.class");
const hooks = require("./hooks");

module.exports = function (app) {
  const knex = app.get("knex");
  if (typeof knex !== "function") {
    throw new Error("[players-profiles] Missing knex instance");
  }

  const BASE = "/api/v1/players-profiles";

  const options = {
    Model: knex,
    name: "playersprofiles", // ✅ lowercase table
    id: "player_id",
  };

  const service = new PlayersProfiles(options);

  // ✅ σωστό mount path (kebab-case)
  app.use(BASE, service);

  // ✅ σωστό service key (χωρίς leading slash)
  const ppService = app.service("api/v1/players-profiles");
  ppService.hooks(hooks);

  // προαιρετικό: δηλώνουμε methods στο custom refresh (Feathers object service)
  app.use(
    `${BASE}/refresh`,
    {
      async find() {
        return service.fetchFromApi();
      },
    },
    { methods: ["find"] }
  );

  // Auto-import on boot (παραμένει)
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
};
