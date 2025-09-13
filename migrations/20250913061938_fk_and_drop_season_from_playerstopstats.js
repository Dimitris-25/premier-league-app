// migrations/20250913061938_fk_and_drop_season_from_playerstopstats.js
exports.up = async function (knex) {
  // 0) Drop the OLD FK that uses `season` → seasons(season_year)
  await knex.schema.alterTable("playerstopstats", (table) => {
    table.dropForeign("season", "fk_playerstopstats_season_year");
  });

  // 1) Drop old UNIQUE/INDEX that reference `season`
  await knex.schema.alterTable("playerstopstats", (table) => {
    // Αν υπάρχει, θα σβηστεί· αν δεν υπάρχει, MySQL μπορεί να ρίξει σφάλμα.
    // Έχουμε βάλει το dropUnique πριν το dropIndex για να απελευθερωθεί το index.
    table.dropUnique(
      ["league_id", "season", "player_id"],
      "uq_playersTopStats_league_season_player"
    );
    table.dropIndex(["season"], "idx_playersTopStats_season");
  });

  // 2) Add NEW FK season_id → seasons(season_id)
  await knex.schema.alterTable("playerstopstats", (table) => {
    table
      .foreign("season_id", "fk_playerstopstats_season_id")
      .references("season_id")
      .inTable("seasons")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT");
  });

  // 3) New indexes/unique με season_id
  await knex.schema.alterTable("playerstopstats", (table) => {
    table.index(["season_id"], "idx_playerstopstats_season_id");
    table.unique(
      ["league_id", "season_id", "player_id"],
      "uq_playerstopstats_league_seasonid_player"
    );
  });

  // 4) Drop legacy column
  await knex.schema.alterTable("playerstopstats", (table) => {
    table.dropColumn("season");
  });
};

exports.down = async function (knex) {
  // Rollback: επαναφέρουμε το `season` και τα παλιά constraints/indexes
  await knex.schema.alterTable("playerstopstats", (table) => {
    table.integer("season").nullable();
    table.dropForeign("season_id", "fk_playerstopstats_season_id");
    table.dropIndex(["season_id"], "idx_playerstopstats_season_id");
    table.dropUnique(
      ["league_id", "season_id", "player_id"],
      "uq_playerstopstats_league_seasonid_player"
    );
  });

  await knex.schema.alterTable("playerstopstats", (table) => {
    table.index(["season"], "idx_playersTopStats_season");
    table.unique(
      ["league_id", "season", "player_id"],
      "uq_playersTopStats_league_season_player"
    );
  });
};
