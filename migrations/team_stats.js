//  Migration team_stats.js

exports.up = async function (knex) {
  await knex.schema.createTable("team_stats", (table) => {
    // Primary key
    table.increments("stats_id").primary().comment("Primary key");

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

    table
      .integer("team_id")
      .unsigned()
      .notNullable()
      .references("team_id")
      .inTable("teamsInfo")
      .onUpdate("CASCADE")
      .onDelete("CASCADE")
      .comment("FK to teamsInfo");

    // Season
    table.integer("season").notNullable().comment("Season year (e.g. 2025)");

    // Form (e.g. 'LDW')
    table.string("form", 10).nullable().comment("Recent form string");

    // Fixtures summary
    table
      .integer("fixtures_played_home")
      .notNullable()
      .defaultTo(0)
      .comment("Games played at home");
    table
      .integer("fixtures_played_away")
      .notNullable()
      .defaultTo(0)
      .comment("Games played away");
    table
      .integer("fixtures_played_total")
      .notNullable()
      .defaultTo(0)
      .comment("Games played total");

    table
      .integer("wins_home")
      .notNullable()
      .defaultTo(0)
      .comment("Wins at home");
    table.integer("wins_away").notNullable().defaultTo(0).comment("Wins away");
    table
      .integer("wins_total")
      .notNullable()
      .defaultTo(0)
      .comment("Wins total");

    table
      .integer("draws_home")
      .notNullable()
      .defaultTo(0)
      .comment("Draws at home");
    table
      .integer("draws_away")
      .notNullable()
      .defaultTo(0)
      .comment("Draws away");
    table
      .integer("draws_total")
      .notNullable()
      .defaultTo(0)
      .comment("Draws total");

    table
      .integer("loses_home")
      .notNullable()
      .defaultTo(0)
      .comment("Losses at home");
    table
      .integer("loses_away")
      .notNullable()
      .defaultTo(0)
      .comment("Losses away");
    table
      .integer("loses_total")
      .notNullable()
      .defaultTo(0)
      .comment("Losses total");

    // Goals totals
    table
      .integer("goals_for_home")
      .notNullable()
      .defaultTo(0)
      .comment("Goals for at home");
    table
      .integer("goals_for_away")
      .notNullable()
      .defaultTo(0)
      .comment("Goals for away");
    table
      .integer("goals_for_total")
      .notNullable()
      .defaultTo(0)
      .comment("Goals for total");

    table
      .integer("goals_against_home")
      .notNullable()
      .defaultTo(0)
      .comment("Goals against at home");
    table
      .integer("goals_against_away")
      .notNullable()
      .defaultTo(0)
      .comment("Goals against away");
    table
      .integer("goals_against_total")
      .notNullable()
      .defaultTo(0)
      .comment("Goals against total");

    // Goals averages (store as decimal percentage per game)
    table
      .decimal("avg_goals_for_home", 5, 2)
      .nullable()
      .comment("Avg goals for at home");
    table
      .decimal("avg_goals_for_away", 5, 2)
      .nullable()
      .comment("Avg goals for away");
    table
      .decimal("avg_goals_for_total", 5, 2)
      .nullable()
      .comment("Avg goals for total");

    table
      .decimal("avg_goals_against_home", 5, 2)
      .nullable()
      .comment("Avg goals against at home");
    table
      .decimal("avg_goals_against_away", 5, 2)
      .nullable()
      .comment("Avg goals against away");
    table
      .decimal("avg_goals_against_total", 5, 2)
      .nullable()
      .comment("Avg goals against total");

    // Clean sheets & failed to score
    table
      .integer("clean_sheet_home")
      .notNullable()
      .defaultTo(0)
      .comment("Clean sheets at home");
    table
      .integer("clean_sheet_away")
      .notNullable()
      .defaultTo(0)
      .comment("Clean sheets away");
    table
      .integer("clean_sheet_total")
      .notNullable()
      .defaultTo(0)
      .comment("Clean sheets total");

    table
      .integer("failed_to_score_home")
      .notNullable()
      .defaultTo(0)
      .comment("Failed to score at home");
    table
      .integer("failed_to_score_away")
      .notNullable()
      .defaultTo(0)
      .comment("Failed to score away");
    table
      .integer("failed_to_score_total")
      .notNullable()
      .defaultTo(0)
      .comment("Failed to score total");

    // Penalties
    table
      .integer("penalty_scored_total")
      .notNullable()
      .defaultTo(0)
      .comment("Penalties scored");
    table
      .decimal("penalty_scored_percentage", 5, 2)
      .nullable()
      .comment("Penalties scored % (0-100)");
    table
      .integer("penalty_missed_total")
      .notNullable()
      .defaultTo(0)
      .comment("Penalties missed");
    table
      .decimal("penalty_missed_percentage", 5, 2)
      .nullable()
      .comment("Penalties missed % (0-100)");
    table
      .integer("penalty_total")
      .notNullable()
      .defaultTo(0)
      .comment("Penalties total");

    // Biggest results / streaks
    table
      .integer("biggest_streak_wins")
      .notNullable()
      .defaultTo(0)
      .comment("Longest wins streak");
    table
      .integer("biggest_streak_draws")
      .notNullable()
      .defaultTo(0)
      .comment("Longest draws streak");
    table
      .integer("biggest_streak_loses")
      .notNullable()
      .defaultTo(0)
      .comment("Longest losses streak");

    table
      .string("biggest_win_home", 10)
      .nullable()
      .comment("Best home win score e.g. '3-2'");
    table
      .string("biggest_win_away", 10)
      .nullable()
      .comment("Best away win score");
    table
      .string("biggest_lose_home", 10)
      .nullable()
      .comment("Worst home loss score");
    table
      .string("biggest_lose_away", 10)
      .nullable()
      .comment("Worst away loss score");

    table
      .integer("biggest_goals_for_home")
      .nullable()
      .comment("Max goals scored at home in a match");
    table
      .integer("biggest_goals_for_away")
      .nullable()
      .comment("Max goals scored away in a match");
    table
      .integer("biggest_goals_against_home")
      .nullable()
      .comment("Max goals conceded at home in a match");
    table
      .integer("biggest_goals_against_away")
      .nullable()
      .comment("Max goals conceded away in a match");

    // Constraints & indexes
    table.unique(["team_id", "league_id", "season"], {
      indexName: "uq_team_stats_team_league_season",
    });

    table.index(["league_id", "season"], "idx_team_stats_league_season");
    table.index(["team_id"], "idx_team_stats_team");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("team_stats");
};
