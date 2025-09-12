//  Migration cities.js

exports.up = async function (knex) {
  await knex.schema.createTable("cities", (table) => {
    // Primary key
    table.increments("city_id").primary().comment("Primary key");

    // Basic info
    table.string("name", 150).notNullable().comment("City name");

    // Foreign key to countries
    table
      .string("country_code", 10)
      .notNullable()
      .references("code")
      .inTable("countries")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT")
      .comment("FK to countries by code (e.g., GR, ENG)");

    // Unique constraint (name + country)
    table.unique(["name", "country_code"], "uq_cities_name_country");

    // Helpful index for joins/filters
    table.index(["country_code"], "idx_cities_country_code");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("cities");
};
