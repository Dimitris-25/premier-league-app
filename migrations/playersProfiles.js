// migrations playersProfiles.js

exports.up = async function (knex) {
  await knex.schema.createTable("playersProfiles", (table) => {
    // Primary key
    table.increments("player_id").unsigned().primary().comment("Primary key");

    // API unique id
    table
      .integer("api_player_id")
      .unsigned()
      .notNullable()
      .unique()
      .comment("Player ID from API-Football");

    // Current team (FK) + API ref
    table
      .integer("team_id")
      .unsigned()
      .nullable()
      .references("team_id")
      .inTable("teamsInfo")
      .onUpdate("CASCADE")
      .onDelete("SET NULL")
      .comment("FK to teamsInfo (current team)");
    table
      .integer("api_team_id")
      .nullable()
      .comment("Team ID from API-Football");

    // Basic profile info
    table.string("name", 120).notNullable().comment("Full name");
    table.string("firstname", 100).nullable().comment("First name");
    table.string("lastname", 100).nullable().comment("Last name");
    table.integer("age").nullable().comment("Age");
    table.date("birth_date").nullable().comment("Birth date");
    table.string("birth_place", 120).nullable().comment("Birth place");
    table.string("birth_country", 100).nullable().comment("Birth country");
    table.string("nationality", 100).nullable().comment("Nationality");
    table.string("height", 20).nullable().comment("Height (e.g. 175 cm)");
    table.string("weight", 20).nullable().comment("Weight (e.g. 68 kg)");
    table.integer("number").nullable().comment("Shirt number");
    table.string("position", 50).nullable().comment("Playing position");
    table.string("photo", 255).nullable().comment("Photo URL");

    // Indexes
    table.index(["team_id"], "idx_playersProfiles_team");
    table.index(["api_team_id"], "idx_playersProfiles_api_team");
    table.index(["nationality"], "idx_playersProfiles_nationality");
    table.index(["name"], "idx_playersProfiles_name");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("playersProfiles");
};
