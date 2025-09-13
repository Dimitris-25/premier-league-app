// migrations/XXXXXXXXXXXX_add_season_id_to_playersfixturesstats.js
exports.up = async function (knex) {
  // 1) Προσθήκη season_id (nullable για να γεμίσουμε πρώτα δεδομένα)
  await knex.schema.alterTable("playersfixturesstats", (table) => {
    table.integer("season_id").unsigned().nullable().comment("FK to seasons");
  });

  // 2) Backfill από το υπάρχον 'season' χρησιμοποιώντας seasons(season_year)
  await knex.raw(`
    UPDATE playersfixturesstats pfs
    JOIN seasons s ON s.season_year = pfs.season
    SET pfs.season_id = s.season_id
    WHERE pfs.season_id IS NULL
  `);

  // 3) Κάν’ το NOT NULL αφού γέμισε
  await knex.schema.alterTable("playersfixturesstats", (table) => {
    table.integer("season_id").unsigned().notNullable().alter();
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("playersfixturesstats", (table) => {
    table.dropColumn("season_id");
  });
};
