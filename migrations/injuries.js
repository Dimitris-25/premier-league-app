// migrations/XXXX_create_injuries.js
exports.up = async function (knex) {
  await knex.schema.createTable("injuries", (table) => {
    // Primary key
    table.increments("injury_id").primary().comment("Primary key");

    // FKs
    table
      .integer("player_id")
      .unsigned()
      .notNullable()
      .references("player_id")
      .inTable("playersProfiles")
      .onUpdate("CASCADE")
      .onDelete("CASCADE")
      .comment("FK to playersProfiles");

    table
      .integer("team_id")
      .unsigned()
      .notNullable()
      .references("team_id")
      .inTable("teamsInfo")
      .onUpdate("CASCADE")
      .onDelete("CASCADE")
      .comment("FK to teamsInfo");

    table
      .integer("fixture_id")
      .unsigned()
      .nullable()
      .references("fixture_id")
      .inTable("fixtures")
      .onUpdate("CASCADE")
      .onDelete("SET NULL")
      .comment("FK to fixtures (nullable)");

    table
      .integer("league_id")
      .unsigned()
      .notNullable()
      .references("league_id")
      .inTable("leagues")
      .onUpdate("CASCADE")
      .onDelete("CASCADE")
      .comment("FK to leagues");

    // Basics
    table.integer("season").notNullable().comment("Season year");
    table
      .string("type", 100)
      .notNullable()
      .comment("Injury/absence type (e.g., Missing Fixture)");
    table
      .string("reason", 255)
      .nullable()
      .comment("Reason (e.g., Ruptured cruciate ligament)");

    // Timing
    table
      .timestamp("date_utc")
      .nullable()
      .comment("Related date in UTC (from fixture/date if present)");
    table
      .string("timezone", 50)
      .notNullable()
      .defaultTo("UTC")
      .comment("Timezone from API");
    table
      .bigInteger("timestamp")
      .nullable()
      .comment("Unix timestamp if provided");

    // Indexes
    table.index(["player_id"], "idx_injuries_player");
    table.index(["team_id"], "idx_injuries_team");
    table.index(["league_id", "season"], "idx_injuries_league_season");
    table.index(["fixture_id"], "idx_injuries_fixture");
    table.index(["date_utc"], "idx_injuries_date");

    // De-dup (συγκρατεί διπλοεγγραφές από το API)
    table.unique(
      ["player_id", "team_id", "league_id", "season", "fixture_id"],
      "uq_injuries_player_team_league_season_fixture"
    );
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("injuries");
};
