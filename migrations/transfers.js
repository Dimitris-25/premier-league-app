// migrations/XXXX_create_transfers.js
exports.up = async function (knex) {
  await knex.schema.createTable("transfers", (table) => {
    // Primary key
    table.increments("transfer_id").primary().comment("Primary key");

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

    // Foreign keys to teams (in/out)
    table
      .integer("team_in_id")
      .unsigned()
      .nullable()
      .references("team_id")
      .inTable("teamsInfo")
      .onUpdate("CASCADE")
      .onDelete("SET NULL")
      .comment("FK to teamsInfo (in)");

    table
      .integer("team_out_id")
      .unsigned()
      .nullable()
      .references("team_id")
      .inTable("teamsInfo")
      .onUpdate("CASCADE")
      .onDelete("SET NULL")
      .comment("FK to teamsInfo (out)");

    // Transfer info
    table.date("date").notNullable().comment("Transfer date");
    table
      .string("type", 50)
      .nullable()
      .comment("Transfer type (e.g., Loan, Free, Permanent)");

    // API update timestamp
    table.timestamp("update_date").nullable().comment("Last update from API");

    // Indexes
    table.index(["player_id"], "idx_transfers_player");
    table.index(["team_in_id"], "idx_transfers_team_in");
    table.index(["team_out_id"], "idx_transfers_team_out");
    table.index(["date"], "idx_transfers_date");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("transfers");
};
