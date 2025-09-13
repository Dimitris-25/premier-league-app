// migrations/XXXXXXXXXXXX_drop_season_from_playersfixturesstats.js
exports.up = async function (knex) {
  await knex.schema.alterTable("playersfixturesstats", (table) => {
    table.dropColumn("season");
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("playersfixturesstats", (table) => {
    table.integer("season").nullable();
  });
};
