// migrations/XXXXXXXXXXXX_drop_season_from_playerstopstats.js
exports.up = async function (knex) {
  await knex.schema.alterTable("playersFixturesStats", (table) => {
    table.dropColumn("season"); // drop ONLY this column
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("playerFixturesStats", (table) => {
    table.integer("season").nullable(); // restore if needed
  });
};
