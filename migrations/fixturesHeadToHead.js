// Migration fixturesHeadToHead.js
exports.up = async function (knex) {
  await knex.schema.createTable("fixturesHeadToHead", (table) => {
    // Primary key
    table.increments("h2h_id").primary().comment("Primary key");

    // API unique id
    table
      .integer("api_fixture_id")
      .unsigned()
      .notNullable()
      .unique()
      .comment("Fixture ID from API-Football");

    // League / season / round
    table
      .integer("league_id")
      .unsigned()
      .notNullable()
      .references("league_id")
      .inTable("leagues")
      .onUpdate("CASCADE")
      .onDelete("CASCADE")
      .comment("FK to leagues");
    table.integer("season").notNullable().comment("Season year (e.g. 2018)");
    table
      .string("round", 50)
      .nullable()
      .comment("Round name (e.g. 'Regular Season - 8')");

    // Datetime / status
    table.dateTime("date_utc").notNullable().comment("Fixture date (UTC)");
    table
      .bigInteger("timestamp")
      .nullable()
      .comment("Fixture timestamp (epoch)");
    table.string("timezone", 50).nullable().comment("Timezone");
    table.string("referee", 120).nullable().comment("Referee name");
    table.string("status_short", 10).nullable().comment("Match status code");
    table.string("status_long", 50).nullable().comment("Match status text");
    table.integer("elapsed").nullable().comment("Elapsed minutes");
    table.integer("status_extra").nullable().comment("Extra/stoppage minutes");

    // Venue
    table
      .integer("venue_id")
      .unsigned()
      .nullable()
      .references("venue_id")
      .inTable("venues")
      .onUpdate("CASCADE")
      .onDelete("SET NULL")
      .comment("FK to venues");
    table
      .string("venue_name", 120)
      .nullable()
      .comment("Venue name (denormalized)");
    table
      .string("venue_city", 120)
      .nullable()
      .comment("Venue city (denormalized)");

    // Teams
    table
      .integer("home_team_id")
      .unsigned()
      .notNullable()
      .references("team_id")
      .inTable("teamsInfo")
      .onUpdate("CASCADE")
      .onDelete("CASCADE")
      .comment("FK to teamsInfo (home)");
    table
      .integer("away_team_id")
      .unsigned()
      .notNullable()
      .references("team_id")
      .inTable("teamsInfo")
      .onUpdate("CASCADE")
      .onDelete("CASCADE")
      .comment("FK to teamsInfo (away)");

    // Score summary
    table.integer("goals_home").nullable().comment("Goals scored by home team");
    table.integer("goals_away").nullable().comment("Goals scored by away team");

    // Score breakdown
    table.integer("ht_home").nullable().comment("Halftime goals home");
    table.integer("ht_away").nullable().comment("Halftime goals away");
    table.integer("ft_home").nullable().comment("Fulltime goals home");
    table.integer("ft_away").nullable().comment("Fulltime goals away");
    table.integer("et_home").nullable().comment("Extra time goals home");
    table.integer("et_away").nullable().comment("Extra time goals away");
    table.integer("pen_home").nullable().comment("Penalty shootout goals home");
    table.integer("pen_away").nullable().comment("Penalty shootout goals away");

    // Winners (booleans for convenience)
    table.boolean("home_winner").nullable().comment("Home team winner flag");
    table.boolean("away_winner").nullable().comment("Away team winner flag");

    // Indexes
    table.index(
      ["league_id", "season", "round"],
      "idx_h2h_league_season_round"
    );
    table.index(["date_utc"], "idx_h2h_date");
    table.index(["home_team_id", "away_team_id"], "idx_h2h_teams");
    table.index(
      ["home_team_id", "away_team_id", "league_id", "season"],
      "idx_h2h_pair_league_season"
    );
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("fixturesHeadToHead");
};
