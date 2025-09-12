// Migration events.js
exports.up = async function (knex) {
  await knex.schema.createTable("events", (table) => {
    // PK
    table.increments("event_id").primary().comment("Primary key");

    // FK -> fixtures
    table
      .integer("fixture_id")
      .unsigned()
      .notNullable()
      .references("fixture_id")
      .inTable("fixtures")
      .onUpdate("CASCADE")
      .onDelete("CASCADE")
      .comment("FK to fixtures");

    // FK -> teamsInfo (team that the event belongs to)
    table
      .integer("team_id")
      .unsigned()
      .nullable()
      .references("team_id")
      .inTable("teamsInfo")
      .onUpdate("CASCADE")
      .onDelete("SET NULL")
      .comment("FK to teamsInfo");

    // Time info
    table.integer("time_elapsed").notNullable().comment("Elapsed minutes");
    table.integer("time_extra").nullable().comment("Extra time minutes");

    // Optional denormalized team fields
    table.string("team_name", 100).nullable().comment("Team name");
    table.string("team_logo", 255).nullable().comment("Team logo URL");

    // Player info (API ids/names)
    table.integer("player_id").nullable().comment("Player ID from API");
    table.string("player_name", 100).nullable().comment("Player name");

    // Assist info
    table.integer("assist_id").nullable().comment("Assist ID from API");
    table.string("assist_name", 100).nullable().comment("Assist name");

    // Event details
    table
      .string("type", 50)
      .notNullable()
      .comment("Event type (Goal, Card, subst)");
    table
      .string("detail", 50)
      .notNullable()
      .comment("Event detail (e.g. Yellow Card, Substitution 1)");
    table.string("comments", 255).nullable().comment("Additional comments");

    // Indexes
    table.index(["fixture_id"], "idx_events_fixture");
    table.index(["team_id"], "idx_events_team");
    table.index(["player_id"], "idx_events_player");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("events");
};
