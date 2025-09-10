/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.alterTable("leagues", (table) => {
    table
      .integer("api_league_id")
      .notNullable()
      .unique()
      .comment("League ID from API-Football");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.alterTable("leagues", (table) => {
    table.dropColumn("api_league_id");
  });
};
