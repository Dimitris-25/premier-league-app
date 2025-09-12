// migrations/XXXX_create_trophies.js
exports.up = async function (knex) {
  await knex.schema.createTable("trophies", (table) => {
    // Primary key
    table.increments("trophy_id").primary().comment("Primary key");

    // Foreign key to players
    table
      .integer("player_id")
      .unsigned()
      .notNullable()
      .references("player_id")
      .inTable("playersProfiles")
      .onUpdate("CASCADE")
      .onDelete("CASCADE")
      .comment("FK to playersProfiles");

    // Trophy info
    table
      .string("league", 100)
      .notNullable()
      .comment("League/competition name");
    table.string("country", 100).nullable().comment("Country of competition");
    table
      .string("season", 50)
      .notNullable()
      .comment("Season or edition (e.g. 2023/2024, Brazil 2011)");
    table
      .string("place", 50)
      .notNullable()
      .comment("Result (Winner, 2nd Place, etc.)");

    // Indexes
    table.index(["player_id"], "idx_trophies_player");
    table.index(["league"], "idx_trophies_league");
    table.index(["season"], "idx_trophies_season");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("trophies");
};
