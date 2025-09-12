// migrations/teamsInfo.js

exports.up = async function (knex) {
  await knex.schema.createTable("teamsInfo", (table) => {
    // Primary key (internal)
    table.increments("team_id").unsigned().primary().comment("Primary key");

    // External/API identity
    table
      .integer("api_team_id")
      .unsigned()
      .notNullable()
      .unique()
      .comment("Team ID from API-Football");

    // Basic columns
    table.string("name", 100).notNullable().comment("Team name");
    table.string("code", 10).nullable().comment("Short team code");
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
      .onDelete("SET NULL")
      .comment("FK to venues");

    // FK -> countries
    table
      .integer("country_id")
      .unsigned()
      .nullable()
      .references("country_id")
      .inTable("countries")
      .onUpdate("CASCADE")
      .onDelete("SET NULL")
      .comment("FK to countries");

    // Uniques
    table.unique(["name", "country_id"], {
      indexName: "uq_teamsInfo_name_country",
    });

    // Indexes
    table.index(["api_team_id"], "idx_teamsInfo_api_team_id");
    table.index(["country_id"], "idx_teamsInfo_country");
    table.index(["venue_id"], "idx_teamsInfo_venue");
    table.index(["name"], "idx_teamsInfo_name");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("teamsInfo");
};
