// migrations/ playersSeasonStats.js
exports.up = async function (knex) {
  await knex.schema.createTable("playersSeasonStats", (table) => {
    // PK
    table.increments("pss_id").primary().comment("Primary key");

    // Entity FKs (team/league/player + season)
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
      .integer("league_id")
      .unsigned()
      .notNullable()
      .references("league_id")
      .inTable("leagues")
      .onUpdate("CASCADE")
      .onDelete("CASCADE")
      .comment("FK to leagues");

    table.integer("season").notNullable().comment("Season year (e.g. 2025)");

    // ---- Games (season aggregates) ----
    table.integer("games_appearences").nullable();
    table.integer("games_lineups").nullable();
    table.integer("games_minutes").nullable();
    table.integer("games_number").nullable();
    table.string("games_position", 20).nullable();
    table.decimal("games_rating", 4, 2).nullable();
    table.boolean("games_captain").nullable();

    // Substitutes
    table.integer("subs_in").nullable();
    table.integer("subs_out").nullable();
    table.integer("subs_bench").nullable();

    // Shots
    table.integer("shots_total").nullable();
    table.integer("shots_on").nullable();

    // Goals
    table.integer("goals_total").nullable();
    table.integer("goals_conceded").nullable();
    table.integer("goals_assists").nullable();
    table.integer("goals_saves").nullable();

    // Passes
    table.integer("passes_total").nullable();
    table.integer("passes_key").nullable();
    table.integer("passes_accuracy").nullable();

    // Tackles
    table.integer("tackles_total").nullable();
    table.integer("tackles_blocks").nullable();
    table.integer("tackles_interceptions").nullable();

    // Duels
    table.integer("duels_total").nullable();
    table.integer("duels_won").nullable();

    // Dribbles
    table.integer("dribbles_attempts").nullable();
    table.integer("dribbles_success").nullable();
    table.integer("dribbles_past").nullable();

    // Fouls
    table.integer("fouls_drawn").nullable();
    table.integer("fouls_committed").nullable();

    // Cards
    table.integer("cards_yellow").nullable();
    table.integer("cards_yellowred").nullable();
    table.integer("cards_red").nullable();

    // Penalties (κρατάμε ορθογραφία όπως στο API)
    table.integer("penalty_won").nullable();
    table.integer("penalty_commited").nullable();
    table.integer("penalty_scored").nullable();
    table.integer("penalty_missed").nullable();
    table.integer("penalty_saved").nullable();

    // Μοναδικότητα: ένας παίκτης ανά (team, league, season)
    table.unique(["player_id", "team_id", "league_id", "season"], {
      indexName: "uq_pss_player_team_league_season",
    });

    // Indexes
    table.index(["team_id", "season"], "idx_pss_team_season");
    table.index(["league_id", "season"], "idx_pss_league_season");
    table.index(["player_id"], "idx_pss_player");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("playersSeasonStats");
};
