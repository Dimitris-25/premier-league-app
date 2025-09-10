exports.up = async function (knex) {
  await knex.schema.createTable("venues", (table) => {
    // Primary key
    table.increments("venue_id").primary().comment("Primary key");

    // API ID
    table
      .integer("api_venue_id")
      .notNullable()
      .unique()
      .comment("Venue ID from API-Football");

    // Basic info
    table.string("name", 150).notNullable().comment("Venue name");
    table.string("address", 255).nullable().comment("Venue address");
    table.integer("capacity").nullable().comment("Venue capacity");
    table.string("surface", 50).nullable().comment("Type of surface");
    table.string("image", 255).nullable().comment("Venue image URL");

    // Foreign key to cities
    table
      .integer("city_id")
      .unsigned()
      .nullable()
      .references("city_id")
      .inTable("cities")
      .onUpdate("CASCADE")
      .onDelete("SET NULL")
      .comment("FK to cities");

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

    // Unique constraint (name + city + country)
    table.unique(["name", "city_id", "country_id"], {
      indexName: "uq_venues_name_city_country",
    });
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("venues");
};
