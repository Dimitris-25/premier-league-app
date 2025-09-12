// Migration /seasons.js
exports.up = async function (knex) {
  await knex.schema.createTable("seasons", (table) => {
    // Primary key (INT UNSIGNED AUTO_INCREMENT)
    table
      .increments("season_id")
      .primary()
      .comment("Primary key (INT UNSIGNED)");

    // Season metadata
    table
      .integer("season_year")
      .notNullable()
      .unique()
      .comment("Season year (e.g., 2025)");

    table.date("start").nullable().comment("Season start date (UTC)");
    table.date("end").nullable().comment("Season end date (UTC)");

    table
      .boolean("current")
      .notNullable()
      .defaultTo(false)
      .comment("Marks the current season");

    // Indexes
    table.index(["start"], "idx_seasons_start");
    table.index(["end"], "idx_seasons_end");
    table.index(["current"], "idx_seasons_current");
    table.index(["start", "end"], "idx_seasons_range");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("seasons");
};
