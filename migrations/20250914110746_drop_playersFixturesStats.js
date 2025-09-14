exports.up = async function (knex) {
  await knex.schema.dropTableIfExists("playersFixturesStats");
};

exports.down = async function (knex) {
  // (προαιρετικά) ξαναδημιούργησε τον πίνακα όπως ήταν πριν
  await knex.schema.createTable("playersFixturesStats", (table) => {
    table.increments("pfs_id").primary();
    // ξαναγράψε εδώ τα columns αν θες rollback
  });
};
