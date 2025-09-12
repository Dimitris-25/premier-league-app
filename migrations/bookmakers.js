// migrations create_bookmakers.js
exports.up = async function (knex) {
  await knex.schema.createTable("bookmakers", (table) => {
    // Primary key
    table.increments("bookmaker_id").primary().comment("Primary key");

    // API identity (from API-Football)
    table
      .integer("api_bookmaker_id")
      .unsigned()
      .notNullable()
      .unique()
      .comment("Bookmaker ID from API-Football");

    // Basic fields
    table.string("name", 100).notNullable().comment("Bookmaker name");

    // Optional unique to avoid duplicates by name
    table.unique(["name"], "uq_bookmakers_name");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("bookmakers");
};
