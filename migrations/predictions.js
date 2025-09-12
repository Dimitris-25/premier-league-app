// Migration predictions.js

exports.up = async function (knex) {
  await knex.schema.createTable("predictions", (table) => {
    // Primary key
    table.increments("prediction_id").primary().comment("Primary key");

    // Foreign key to fixtures
    table
      .integer("fixture_id")
      .unsigned()
      .notNullable()
      .references("fixture_id")
      .inTable("fixtures")
      .onUpdate("CASCADE")
      .onDelete("CASCADE")
      .comment("FK to fixtures");

    // Foreign key to teams (winner)
    table
      .integer("winner_id")
      .unsigned()
      .nullable()
      .references("team_id")
      .inTable("teamsInfo")
      .onUpdate("CASCADE")
      .onDelete("SET NULL")
      .comment("FK to teamsInfo (predicted winner)");

    // API reference (if provided by API-Football)
    table
      .integer("api_prediction_id")
      .unsigned()
      .nullable()
      .unique()
      .comment("Prediction ID from API-Football, if available");

    // Prediction details
    table
      .string("winner_comment", 100)
      .nullable()
      .comment("Winner comment e.g. Home/Away");
    table
      .boolean("win_or_draw")
      .notNullable()
      .defaultTo(false)
      .comment("True if win or draw");
    table.string("under_over", 50).nullable().comment("Over/Under prediction");
    table.decimal("goals_home", 4, 2).nullable().comment("Expected goals home");
    table.decimal("goals_away", 4, 2).nullable().comment("Expected goals away");
    table.text("advice").nullable().comment("Prediction advice");

    // Percentages
    table.string("percent_home", 10).nullable().comment("Win % home");
    table.string("percent_draw", 10).nullable().comment("Draw %");
    table.string("percent_away", 10).nullable().comment("Win % away");

    // Indexes for fast lookup
    table.index(["fixture_id"], "idx_predictions_fixture");
    table.index(["winner_id"], "idx_predictions_winner");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("predictions");
};
