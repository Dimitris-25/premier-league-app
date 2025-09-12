// migrations playersFixturesStats.js

exports.up = async function (knex) {
  await knex.schema.createTable("playersFixturesStats", (table) => {
    // Primary key
    table.increments("id").primary().comment("Primary key");

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

    // Entity FKs
    table
      .integer("team_id")
      .unsigned()
      .notNullable()
      .references("team_id")
      .inTable("teamsInfo")
      .onUpdate("CASCADE")
      .onDelete("CASCADE")
      .comment("FK to teamsInfo (player's team in the fixture)");
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
      .integer("league_id")
      .unsigned()
      .notNullable()
      .references("league_id")
      .inTable("leagues")
      .onUpdate("CASCADE")
      .onDelete("CASCADE")
      .comment("FK to leagues");
    table.integer("season").notNullable().comment("Season year (e.g. 2025)");

    // Games
    table.integer("games_minutes").nullable().comment("Minutes played");
    table.integer("games_number").nullable().comment("Shirt number");
    table
      .string("games_position", 5)
      .nullable()
      .comment("Position code (G/D/M/F)");
    table.decimal("games_rating", 4, 2).nullable().comment("Match rating");
    table.boolean("games_captain").nullable().comment("Was captain");
    table.boolean("games_substitute").nullable().comment("Appeared as sub");

    // Others
    table.integer("offsides").nullable().comment("Offsides");

    // Shots
    table.integer("shots_total").nullable().comment("Total shots");
    table.integer("shots_on").nullable().comment("Shots on target");

    // Goals
    table.integer("goals_total").nullable().comment("Goals scored");
    table
      .integer("goals_conceded")
      .nullable()
      .comment("Goals conceded (GK/Team)");
    table.integer("goals_assists").nullable().comment("Assists");
    table.integer("goals_saves").nullable().comment("Saves (GK)");

    // Passes
    table.integer("passes_total").nullable().comment("Total passes");
    table.integer("passes_key").nullable().comment("Key passes");
    table
      .integer("passes_accuracy")
      .nullable()
      .comment("Accurate passes count");

    // Tackles
    table.integer("tackles_total").nullable().comment("Tackles total");
    table.integer("tackles_blocks").nullable().comment("Blocks");
    table.integer("tackles_interceptions").nullable().comment("Interceptions");

    // Duels
    table.integer("duels_total").nullable().comment("Duels total");
    table.integer("duels_won").nullable().comment("Duels won");

    // Dribbles
    table.integer("dribbles_attempts").nullable().comment("Dribble attempts");
    table.integer("dribbles_success").nullable().comment("Successful dribbles");
    table.integer("dribbles_past").nullable().comment("Times dribbled past");

    // Fouls
    table.integer("fouls_drawn").nullable().comment("Fouls drawn");
    table.integer("fouls_committed").nullable().comment("Fouls committed");

    // Cards
    table.integer("cards_yellow").nullable().comment("Yellow cards");
    table.integer("cards_red").nullable().comment("Red cards");

    // Penalties
    table.integer("penalty_won").nullable().comment("Penalties won");
    table.integer("penalty_commited").nullable().comment("Penalties committed");
    table.integer("penalty_scored").nullable().comment("Penalties scored");
    table.integer("penalty_missed").nullable().comment("Penalties missed");
    table.integer("penalty_saved").nullable().comment("Penalties saved (GK)");

    // One row per player per fixture
    table.unique(["fixture_id", "player_id"], {
      indexName: "uq_playersFixturesStats_fixture_player",
    });

    // Indexes
    table.index(["fixture_id"], "idx_pfs_fixture");
    table.index(["api_fixture_id"], "idx_pfs_api_fixture");
    table.index(["player_id"], "idx_pfs_player");
    table.index(["team_id"], "idx_pfs_team");
    table.index(["league_id", "season"], "idx_pfs_league_season");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("playersFixturesStats");
};
