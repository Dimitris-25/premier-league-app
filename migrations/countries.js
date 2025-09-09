// migrations/20250909_create_countries.js
// Migration for creating the `countries` table

exports.up = async function (knex) {
  const exists = await knex.schema.hasTable("countries");
  if (exists) return;

  await knex.schema.createTable("countries", (table) => {
    // Primary key
    table.increments("country_id").primary().comment("Primary key");

    // Country name (e.g. "Greece")
    table.string("name", 100).notNullable().comment("Country name");

    // ISO country code like "GR" (nullable in API-Football)
    table.string("code", 3).nullable().comment("ISO country code");

    // Flag URL from API-Football (nullable)
    table.string("flag", 255).nullable().comment("Flag URL");

    // Ensure uniqueness
    table.unique(["name"], { indexName: "uq_countries_name" });
    table.unique(["code"], { indexName: "uq_countries_code" });
  });
};

exports.down = async function (knex) {
  const exists = await knex.schema.hasTable("countries");
  if (!exists) return;

  await knex.schema.dropTable("countries");
};
