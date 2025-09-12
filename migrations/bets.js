// migrations create_bets.js
exports.up = async function (knex) {
  await knex.schema.createTable("bets", (table) => {
    // Primary key
    table.increments("bet_id").primary().comment("Primary key");

    // API identity (from API-Football)
    table
      .integer("api_bet_id")
      .notNullable()
      .unique()
      .comment("Bet type ID from API-Football (e.g., 4 = Asian Handicap)");

    // Basic fields
    table
      .string("name", 100)
      .notNullable()
      .comment("Bet type name (e.g., Asian Handicap, Over/Under)");

    // Optional unique to avoid duplicates by name
    table.unique(["name"], "uq_bets_name");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("bets");
};
