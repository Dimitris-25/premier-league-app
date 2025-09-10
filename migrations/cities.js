exports.up = async function (knex) {
  await knex.schema.createTable("cities", (table) => {
    // Primary key
    table.increments("city_id").primary().comment("Primary key");

    // Basic info
    table.string("name", 150).notNullable().comment("City name");

    // Foreign key to countries
    table
      .integer("country_id")
      .unsigned()
      .nullable()
      .references("country_id")
      .inTable("countries")
      .onUpdate("CASCADE")
      .onDelete("SET NULL")
      .comment("FK to countries");

    // Unique constraint (name + country)
    table.unique(["name", "country_id"], {
      indexName: "uq_cities_name_country",
    });
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("cities");
};
