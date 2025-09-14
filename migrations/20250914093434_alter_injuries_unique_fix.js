// Add functional UNIQUE index on injuries
// Covers (player_id, team_id, league_id, season, fixture_id)
// αλλά μετατρέπει τα NULL fixture_id σε -1 για να μην μπαίνουν διπλοεγγραφές.

exports.up = async function (knex) {
  await knex.raw(`
    CREATE UNIQUE INDEX uq_injuries_player_team_league_season_fixnorm
    ON injuries (
      player_id,
      team_id,
      league_id,
      season,
      (IFNULL(fixture_id, -1))
    )
  `);
};

exports.down = async function (knex) {
  await knex.raw(`
    DROP INDEX uq_injuries_player_team_league_season_fixnorm ON injuries
  `);
};
