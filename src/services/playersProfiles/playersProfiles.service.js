const { PlayersProfiles } = require("./playersProfiles.class");
const hooks = require("./hooks");

module.exports = function (app) {
  const knex = app.get("knex");

  const options = {
    Model: knex,
    name: "playersProfiles",
    id: "player_id",
  };

  const service = new PlayersProfiles(options);
  app.use("/playersProfiles", service);

  const playersProfilesService = app.service("playersProfiles");
  playersProfilesService.hooks(hooks);

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

  app.use("/playersProfiles/refresh", {
    async find() {
      return service.fetchFromApi();
    },
  });
};
