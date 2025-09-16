// MySQL-safe migration για timestamps στο venues
exports.up = async function (knex) {
  const hasCreated = await knex.schema.hasColumn("venues", "created_at");
  if (!hasCreated) {
    await knex.schema.alterTable("venues", (table) => {
      // created_at: τώρα
      table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    });
  }

  const hasUpdated = await knex.schema.hasColumn("venues", "updated_at");
  if (!hasUpdated) {
    await knex.schema.alterTable("venues", (table) => {
      // updated_at: τώρα + ON UPDATE CURRENT_TIMESTAMP
      table
        .timestamp("updated_at")
        .notNullable()
        .defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
    });
  }
};

exports.down = async function (knex) {
  const hasUpdated = await knex.schema.hasColumn("venues", "updated_at");
  if (hasUpdated) {
    await knex.schema.alterTable("venues", (table) => {
      table.dropColumn("updated_at");
    });
  }

  const hasCreated = await knex.schema.hasColumn("venues", "created_at");
  if (hasCreated) {
    await knex.schema.alterTable("venues", (table) => {
      table.dropColumn("created_at");
    });
  }
};
