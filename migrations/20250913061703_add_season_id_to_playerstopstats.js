// migrations/XXXXXXXXXXXX_add_season_id_to_playerstopstats.js
exports.up = async function (knex) {
  // 1) Add season_id as NULLable first (so we can backfill)
  await knex.schema.alterTable("playerstopstats", (table) => {
    table.integer("season_id").unsigned().nullable().comment("FK to seasons");
  });

  // 2) Backfill season_id from existing 'season' using seasons(season_year)
  await knex.raw(`
    UPDATE playerstopstats ps
    JOIN seasons s ON s.season_year = ps.season
    SET ps.season_id = s.season_id
    WHERE ps.season_id IS NULL
  `);

  // 3) Make it NOT NULL after backfill
  await knex.schema.alterTable("playerstopstats", (table) => {
    table.integer("season_id").unsigned().notNullable().alter();
  });
};

exports.down = async function (knex) {
  // Rollback: drop the added column
  await knex.schema.alterTable("playerstopstats", (table) => {
    table.dropColumn("season_id");
  });
};
