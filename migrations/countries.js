exports.up = function (knex) {
  return knex.schema.createTable("countries", (table) => {
    table.string("code", 10).primary(); // π.χ. 'GR', 'ENG'
    table.string("name").notNullable();
    table.string("flag").nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("countries");
};
