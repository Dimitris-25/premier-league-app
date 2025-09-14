exports.up = async function (knex) {
  await knex.schema.alterTable("odds", (t) => {
    t.integer("api_fixture_id").unsigned().nullable();
    t.integer("api_league_id").unsigned().nullable();
    t.index(["api_fixture_id"], "idx_odds_api_fixture");
    t.index(["api_league_id"], "idx_odds_api_league");
  });

  // backfill από fixtures/leagues
  await knex("odds as o").update({
    api_fixture_id: knex.raw(
      "(SELECT f.api_fixture_id FROM fixtures f WHERE f.fixture_id = o.fixture_id)"
    ),
    api_league_id: knex.raw(
      "(SELECT l.api_league_id FROM leagues l WHERE l.league_id = o.league_id)"
    ),
  });
};

exports.down = async function (knex) {
  await knex.schema.alterTable("odds", (t) => {
    t.dropIndex(["api_fixture_id"], "idx_odds_api_fixture");
    t.dropIndex(["api_league_id"], "idx_odds_api_league");
    t.dropColumn("api_fixture_id");
    t.dropColumn("api_league_id");
  });
};
