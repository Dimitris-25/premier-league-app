// Migration coaches.js

exports.up = async function (knex) {
  await knex.schema.createTable("coaches", (table) => {
    // Primary key
    table.increments("coach_id").primary().comment("Primary key");

    // API unique id
    table
      .integer("api_coach_id")
      .unsigned()
      .notNullable()
      .unique()
      .comment("Coach ID from API-Football");

    // Basic info
    table.string("name", 100).notNullable().comment("Coach full name");
    table.string("firstname", 100).nullable().comment("Coach first name");
    table.string("lastname", 100).nullable().comment("Coach last name");
    table.integer("age").nullable().comment("Coach age");
    table.date("birth_date").nullable().comment("Birth date");
    table.string("birth_place", 100).nullable().comment("Birth place");
    table.string("birth_country", 100).nullable().comment("Birth country");
    table.string("nationality", 100).nullable().comment("Nationality");
    table.string("height", 20).nullable().comment("Height (e.g. 191 cm)");
    table.string("weight", 20).nullable().comment("Weight (e.g. 83 kg)");
    table.string("photo", 255).nullable().comment("Coach photo URL");

    // Foreign key to teamsInfo + API reference
    table
      .integer("team_id")
      .unsigned()
      .nullable()
      .references("team_id")
      .inTable("teamsInfo")
      .onUpdate("CASCADE")
      .onDelete("SET NULL")
      .comment("FK to teamsInfo");

    table
      .integer("api_team_id")
      .nullable()
      .comment("Team ID from API-Football");

    // Indexes
    table.index(["team_id"], "idx_coaches_team");
    table.index(["api_team_id"], "idx_coaches_api_team");
    table.index(["nationality"], "idx_coaches_nationality");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("coaches");
};
