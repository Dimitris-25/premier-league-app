// migrations playersTopStats.js

exports.up = async function (knex) {
  await knex.schema.createTable("playersTopStats", (table) => {
    // Primary key
    table.increments("topstat_id").primary().comment("Primary key");

    // Foreign keys
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
      .comment("FK to teamsInfo (player's team)");

    // Stats (aggregated per player for league+season)
    table
      .integer("goals_total")
      .notNullable()
      .defaultTo(0)
      .comment("Total goals");
    table
      .integer("assists_total")
      .notNullable()
      .defaultTo(0)
      .comment("Total assists");
    table
      .integer("yellow_cards")
      .notNullable()
      .defaultTo(0)
      .comment("Total yellow cards");
    table
      .integer("red_cards")
      .notNullable()
      .defaultTo(0)
      .comment("Total red cards");

    // Optional display rank in leaderboard
    table.integer("rank").nullable().comment("Leaderboard rank (1 = top)");

    // Ensure one row per (league, season, player)
    table.unique(["league_id", "season", "player_id"], {
      indexName: "uq_playersTopStats_league_season_player",
    });

    // Indexes
    table.index(["league_id", "season"], "idx_playersTopStats_league_season");
    table.index(["team_id"], "idx_playersTopStats_team");
    table.index(["goals_total"], "idx_playersTopStats_goals");
    table.index(["assists_total"], "idx_playersTopStats_assists");
    table.index(["yellow_cards"], "idx_playersTopStats_yellow");
    table.index(["red_cards"], "idx_playersTopStats_red");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("playersTopStats");
};
