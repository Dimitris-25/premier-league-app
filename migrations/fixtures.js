// Migration fixtures.js

exports.up = async function (knex) {
  await knex.schema.createTable("fixtures", (table) => {
    // Primary key
    table.increments("fixture_id").unsigned().primary().comment("Primary key");

    // API unique id
    table
      .integer("api_fixture_id")
      .unsigned()
      .notNullable()
      .unique()
      .comment("Fixture ID from API-Football");

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
      .integer("venue_id")
      .unsigned()
      .nullable()
      .references("venue_id")
      .inTable("venues")
      .onUpdate("CASCADE")
      .onDelete("SET NULL")
      .comment("FK to venues");

    // Basic info
    table.dateTime("date_utc").notNullable().comment("Fixture date (UTC)");
    table
      .bigInteger("timestamp")
      .nullable()
      .comment("Fixture timestamp (epoch)");

    // Teams
    table
      .integer("home_team_id")
      .unsigned()
      .notNullable()
      .references("team_id")
      .inTable("teamsInfo")
      .onUpdate("CASCADE")
      .onDelete("CASCADE")
      .comment("FK to teamsInfo (home team)");

    table
      .integer("away_team_id")
      .unsigned()
      .notNullable()
      .references("team_id")
      .inTable("teamsInfo")
      .onUpdate("CASCADE")
      .onDelete("CASCADE")
      .comment("FK to teamsInfo (away team)");

    // Scores
    table.integer("goals_home").nullable().comment("Goals scored by home team");
    table.integer("goals_away").nullable().comment("Goals scored by away team");
    table.integer("ht_home").nullable().comment("Halftime goals home");
    table.integer("ht_away").nullable().comment("Halftime goals away");
    table.integer("ft_home").nullable().comment("Fulltime goals home");
    table.integer("ft_away").nullable().comment("Fulltime goals away");
    table.integer("et_home").nullable().comment("Extra time goals home");
    table.integer("et_away").nullable().comment("Extra time goals away");
    table.integer("pen_home").nullable().comment("Penalty goals home");
    table.integer("pen_away").nullable().comment("Penalty goals away");

    // Status
    table
      .string("status_short", 10)
      .nullable()
      .comment("Match status short code");
    table
      .string("status_long", 50)
      .nullable()
      .comment("Match status long text");
    table.integer("elapsed").nullable().comment("Elapsed minutes");
    table
      .integer("stoppage_extra")
      .nullable()
      .comment("Extra stoppage minutes");

    // Round & season
    table.string("round", 50).nullable().comment("Round name");
    table.integer("season").notNullable().comment("Season year");

    // Winner
    table.string("winner", 10).nullable().comment("Winner: home/away/draw");

    table
      .string("timezone", 50)
      .notNullable()
      .defaultTo("UTC")
      .comment("IANA timezone, e.g., Europe/London");

    // Indexes
    table.index(
      ["league_id", "season", "round"],
      "idx_fixtures_league_season_round"
    );
    table.index(["date_utc"], "idx_fixtures_date");
    table.index(["home_team_id"], "idx_fixtures_home_team");
    table.index(["away_team_id"], "idx_fixtures_away_team");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("fixtures");
};
