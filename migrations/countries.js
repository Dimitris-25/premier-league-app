// Migration countries.js

exports.up = async function (knex) {
  await knex.schema.createTable("countries", (table) => {
    // Primary key (INT UNSIGNED AUTO_INCREMENT)
    table.increments("country_id").primary().comment("Primary key");

    // Basic columns
    table
      .string("code", 10)
      .notNullable()
      .unique()
      .comment("Country code (e.g., GR, ENG, GB-ENG)");
    table.string("name", 100).notNullable().comment("Country name");
    table.string("flag", 255).nullable().comment("Country flag URL");

    // Indexes (code is already indexed via UNIQUE)
    table.index(["name"], "idx_countries_name");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("countries");
};
