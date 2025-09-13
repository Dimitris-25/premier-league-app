// migrations/20250913_add_fk_playersTopStats_season_to_seasons_year.js
exports.up = async function (knex) {
  // 1) Τύποι & index στο child column
  await knex.schema.alterTable("playersTopStats", (table) => {
    table.integer("season").notNullable().alter(); // ensure INT NOT NULL
    table.index(["season"], "idx_playersTopStats_season"); // για performance
  });

  // 2) Ensure parent has UNIQUE (το έχει ήδη από το seasons migration)
  //    Αν δεν υπήρχε, θα βάζαμε: table.unique(['season_year'], 'uq_seasons_year')

  // 3) Backfill τυχόν missing seasons στο parent (ασφαλές, idempotent)
  await knex.raw(`
    INSERT INTO seasons (season_year)
    SELECT DISTINCT pts.season
    FROM playersTopStats pts
    LEFT JOIN seasons s ON s.season_year = pts.season
    WHERE s.season_year IS NULL
  `);

  // 4) Προσθήκη Foreign Key
  await knex.schema.alterTable("playersTopStats", (table) => {
    table
      .foreign("season", "fk_playersTopStats_season_year")
      .references("season_year")
      .inTable("seasons")
      .onUpdate("CASCADE")
      .onDelete("RESTRICT"); // δεν σβήνουμε seasons κατά λάθος
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("playersTopStats", (table) => {
    table.dropForeign("season", "fk_playersTopStats_season_year");
    table.dropIndex(["season"], "idx_playersTopStats_season");
  });
};
