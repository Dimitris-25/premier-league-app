exports.up = async function (knex) {
  await knex.schema.createTable("teamsInfo", (table) => {
    // Primary key (το id από το API)
    table.integer("team_id").primary().comment("Team ID from API-Football");

    // Βασικά πεδία
    table.string("name", 100).notNullable().comment("Team name");
    table.string("code", 10).nullable().comment("Team code");
    table.integer("founded").nullable().comment("Year founded");
    table.string("logo", 255).nullable().comment("Team logo URL");

    // FK -> venues
    table
      .integer("venue_id")
      .unsigned()
      .nullable()
      .references("venue_id")
      .inTable("venues")
      .onUpdate("CASCADE")
      .onDelete("SET NULL");

    // FK -> countries
    table
      .integer("country_id")
      .unsigned()
      .nullable()
      .references("country_id")
      .inTable("countries")
      .onUpdate("CASCADE")
      .onDelete("SET NULL");

    // Unique constraint (name + country_id)
    table.unique(["name", "country_id"], {
      indexName: "uq_teamsInfo_name_country",
    });
  });
};

exports.down = async function (knex) {
  // Ρίχνει μόνο το teamsInfo
  await knex.schema.dropTableIfExists("teamsInfo");
};
