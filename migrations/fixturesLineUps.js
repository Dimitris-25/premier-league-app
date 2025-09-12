// migration fixturesLineUps.js
exports.up = async function (knex) {
  // Main lineups table (one row per fixture & team)
  await knex.schema.createTable("fixturesLineUps", (table) => {
    // Primary key
    table.increments("lineup_id").primary().comment("Primary key");

    // Fixture references
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
      .integer("api_fixture_id")
      .unsigned()
      .notNullable()
      .comment("Fixture ID from API-Football");

    // Team
    table
      .integer("team_id")
      .unsigned()
      .notNullable()
      .references("team_id")
      .inTable("teamsInfo")
      .onUpdate("CASCADE")
      .onDelete("CASCADE")
      .comment("FK to teamsInfo (team in this fixture)");

    // Coach (optional FK to coaches for enrichment)
    table
      .integer("coach_id")
      .unsigned()
      .nullable()
      .references("coach_id")
      .inTable("coaches")
      .onUpdate("CASCADE")
      .onDelete("SET NULL")
      .comment("FK to coaches (if available)");
    table.string("coach_name", 120).nullable().comment("Coach display name");
    table.string("coach_photo", 255).nullable().comment("Coach photo URL");

    // Formation
    table
      .string("formation", 20)
      .nullable()
      .comment("Team formation (e.g. 4-3-3)");

    // Team colors (hex without # from API)
    table
      .string("color_player_primary", 12)
      .nullable()
      .comment("Outfield kit primary color");
    table
      .string("color_player_number", 12)
      .nullable()
      .comment("Outfield kit number color");
    table
      .string("color_player_border", 12)
      .nullable()
      .comment("Outfield kit border color");

    table
      .string("color_gk_primary", 12)
      .nullable()
      .comment("GK kit primary color");
    table
      .string("color_gk_number", 12)
      .nullable()
      .comment("GK kit number color");
    table
      .string("color_gk_border", 12)
      .nullable()
      .comment("GK kit border color");

    // Ensure one lineup per (fixture, team)
    table.unique(["fixture_id", "team_id"], {
      indexName: "uq_fixturesLineUps_fixture_team",
    });

    // Indexes
    table.index(["fixture_id"], "idx_fixturesLineUps_fixture");
    table.index(["api_fixture_id"], "idx_fixturesLineUps_api_fixture");
    table.index(["team_id"], "idx_fixturesLineUps_team");
  });

  // Players belonging to a lineup (startXI + substitutes)
  await knex.schema.createTable("fixturesLineUpsPlayers", (table) => {
    // Primary key
    table.increments("lineup_player_id").primary().comment("Primary key");

    // Parent lineup
    table
      .integer("lineup_id")
      .unsigned()
      .notNullable()
      .references("lineup_id")
      .inTable("fixturesLineUps")
      .onUpdate("CASCADE")
      .onDelete("CASCADE")
      .comment("FK to fixturesLineUps");

    // Player reference (optional FK + denormalized name)
    table
      .integer("player_id")
      .unsigned()
      .nullable()
      .references("player_id")
      .inTable("playersProfiles")
      .onUpdate("CASCADE")
      .onDelete("SET NULL")
      .comment("FK to playersProfiles (if available)");
    table
      .string("player_name", 120)
      .notNullable()
      .comment("Player display name");

    // Numbers & positions
    table.integer("number").nullable().comment("Shirt number");
    table.string("pos", 2).nullable().comment("Position code (G/D/M/F)");
    table.string("grid", 12).nullable().comment("Grid position (e.g. 2:3)");

    // Flags
    table
      .boolean("is_starting")
      .notNullable()
      .defaultTo(true)
      .comment("True for starting XI, false for substitutes");

    // Prevent duplicate entries of same player in the same lineup & role
    table.unique(["lineup_id", "player_id", "is_starting"], {
      indexName: "uq_fixturesLineUpsPlayers_lineup_player_role",
    });

    // Indexes
    table.index(["lineup_id"], "idx_fixturesLineUpsPlayers_lineup");
    table.index(["player_id"], "idx_fixturesLineUpsPlayers_player");
    table.index(["is_starting"], "idx_fixturesLineUpsPlayers_is_starting");
    table.index(["number"], "idx_fixturesLineUpsPlayers_number");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("fixturesLineUpsPlayers");
  await knex.schema.dropTableIfExists("fixturesLineUps");
};
