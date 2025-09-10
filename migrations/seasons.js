exports.up = async function (knex) {
  await knex.schema.createTable("seasons", (table) => {
    table.increments("season_id").primary();
    table
      .integer("year")
      .notNullable()
      .unique()
      .comment("Season year, e.g. 2025");
    table.date("start").nullable();
    table.date("end").nullable();
    table.boolean("current").defaultTo(false);
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("seasons");
};
