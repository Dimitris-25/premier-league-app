// Migration create_sidelined.js
exports.up = async function (knex) {
  await knex.schema.createTable("sidelined", (table) => {
    // Primary key
    table.increments("sidelined_id").primary().comment("Primary key");

    // Foreign key to players
    table
      .integer("player_id")
      .unsigned()
      .notNullable()
      .references("player_id")
      .inTable("playersProfiles")
      .onUpdate("CASCADE")
      .onDelete("CASCADE")
      .comment("FK to playersProfiles");

    // Sidelined info
    table
      .string("type", 100)
      .notNullable()
      .comment("Type of sidelined (Injury, Suspended, Virus, etc.)");
    table.date("start_date").notNullable().comment("Start date");
    table.date("end_date").nullable().comment("End date");

    // Indexes
    table.index(["player_id"], "idx_sidelined_player");
    table.index(["type"], "idx_sidelined_type");
    table.index(["start_date"], "idx_sidelined_start");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("sidelined");
};
