// migrations create_odds.js
exports.up = async function (knex) {
  await knex.schema.createTable("odds", (table) => {
    // Primary key
    table.increments("odd_id").primary().comment("Primary key");

    // Foreign keys
    table
      .integer("fixture_id")
      .unsigned()
      .notNullable()
      .references("fixture_id")
      .inTable("fixtures")
      .onUpdate("CASCADE")
      .onDelete("CASCADE")
      .comment("FK to fixtures");

    table
      .integer("league_id")
      .unsigned()
      .notNullable()
      .references("league_id")
      .inTable("leagues")
      .onUpdate("CASCADE")
      .onDelete("CASCADE")
      .comment("FK to leagues");

    // Bookmaker info
    table
      .integer("bookmaker_id")
      .notNullable()
      .comment("Bookmaker ID from API");
    table.string("bookmaker_name", 100).notNullable().comment("Bookmaker name");

    // Bet info
    table
      .integer("bet_id")
      .notNullable()
      .comment("Bet type ID (e.g. 4 = Asian Handicap)");
    table.string("bet_name", 100).notNullable().comment("Bet type name");

    // Value + odd
    table
      .string("value", 50)
      .notNullable()
      .comment("Odd value (e.g., Home -1, Away +0.5)");
    table.decimal("odd", 6, 2).notNullable().comment("Odd number");

    // Update date
    table.timestamp("update_date").nullable().comment("Last update from API");

    table.unique(
      ["fixture_id", "league_id", "bookmaker_id", "bet_id", "value"],
      "uq_odds_row"
    );

    // Indexes
    table.index(["fixture_id"], "idx_odds_fixture");
    table.index(["league_id"], "idx_odds_league");
    table.index(["bookmaker_id"], "idx_odds_bookmaker");
    table.index(["bet_id"], "idx_odds_bet");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("odds");
};
