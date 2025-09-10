/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await knex.schema.alterTable("leagues", (table) => {
    table
      .integer("season_id")
      .unsigned()
      .nullable()
      .references("season_id")
      .inTable("seasons")
      .onUpdate("CASCADE")
      .onDelete("SET NULL")
      .comment("FK to seasons");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.alterTable("leagues", (table) => {
    table.dropColumn("season_id");
  });
};
