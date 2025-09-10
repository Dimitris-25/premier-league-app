exports.up = async function (knex) {
  await knex.schema.createTable("leagues", (table) => {
    // Primary key
    table.increments("league_id").primary().comment("Primary key");

    // Basic columns
    table.string("name", 100).notNullable().comment("League name");
    table.string("type", 50).nullable().comment("League type");
    table.string("logo", 255).nullable().comment("League logo URL");

    table
      .integer("api_league_id")
      .notNullable()
      .unique()
      .comment("League ID from API-Football");

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
    // Foreign Key tou leagues
    table
      .integer("season_id")
      .unsigned()
      .nullable()
      .references("season_id")
      .inTable("seasons")
      .onUpdate("CASCADE")
      .onDelete("SET NULL")
      .comment("FK to seasons");

    // Unique constraint (name + country)
    table.unique(["name", "country_id"], {
      indexName: "uq_leagues_name_country",
    });
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("leagues");
};
