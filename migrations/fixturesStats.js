// migrations fixturesStats.js
exports.up = async function (knex) {
  await knex.schema.createTable("fixturesStats", (table) => {
    // Primary key
    table.increments("stat_id").unsigned().primary().comment("Primary key");

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
      .integer("team_id")
      .unsigned()
      .notNullable()
      .references("team_id")
      .inTable("teamsInfo")
      .onUpdate("CASCADE")
      .onDelete("CASCADE")
      .comment("FK to teamsInfo (team in this fixture)");

    // Ensure one stats row per (fixture, team)
    table.unique(["fixture_id", "team_id"], {
      indexName: "uq_fixturesStats_fixture_team",
    });

    // Statistics
    table.integer("shots_on_goal").nullable().comment("Shots on goal");
    table.integer("shots_off_goal").nullable().comment("Shots off goal");
    table.integer("total_shots").nullable().comment("Total shots");
    table.integer("blocked_shots").nullable().comment("Blocked shots");
    table.integer("shots_inside_box").nullable().comment("Shots inside box");
    table.integer("shots_outside_box").nullable().comment("Shots outside box");
    table.integer("fouls").nullable().comment("Fouls committed");
    table.integer("corner_kicks").nullable().comment("Corner kicks");
    table.integer("offsides").nullable().comment("Offsides");
    table
      .decimal("ball_possession", 5, 2)
      .nullable()
      .comment("Ball possession % (0-100)");
    table.integer("yellow_cards").nullable().comment("Yellow cards");
    table.integer("red_cards").nullable().comment("Red cards");
    table.integer("goalkeeper_saves").nullable().comment("Goalkeeper saves");
    table.integer("total_passes").nullable().comment("Total passes");
    table.integer("passes_accurate").nullable().comment("Accurate passes");
    table
      .decimal("passes_percentage", 5, 2)
      .nullable()
      .comment("Pass accuracy % (0-100)");

    table.string("type", 30).notNullable().comment("Stat type");

    table.unique(
      ["fixture_id", "team_id", "type"],
      "uq_fstats_fixture_team_type"
    );

    // Indexes
    table.index(["fixture_id"], "idx_fixturesStats_fixture");
    table.index(["team_id"], "idx_fixturesStats_team");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("fixturesStats");
};
