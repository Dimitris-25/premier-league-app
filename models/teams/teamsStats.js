const pool = require("../../config/db");

// ➕ Insert ή Update team_stats
async function insertTeamStats(stats) {
  await pool.query(
    `INSERT INTO team_stats (
      team_id, league_id, season_id,
      played_total, played_home, played_away,
      wins_total, wins_home, wins_away,
      draws_total, draws_home, draws_away,
      loses_total, loses_home, loses_away,
      goals_for_total, goals_against_total,
      failed_to_score_total
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    ON DUPLICATE KEY UPDATE
      played_total = VALUES(played_total),
      played_home = VALUES(played_home),
      played_away = VALUES(played_away),
      wins_total = VALUES(wins_total),
      wins_home = VALUES(wins_home),
      wins_away = VALUES(wins_away),
      draws_total = VALUES(draws_total),
      draws_home = VALUES(draws_home),
      draws_away = VALUES(draws_away),
      loses_total = VALUES(loses_total),
      loses_home = VALUES(loses_home),
      loses_away = VALUES(loses_away),
      goals_for_total = VALUES(goals_for_total),
      goals_against_total = VALUES(goals_against_total),
      failed_to_score_total = VALUES(failed_to_score_total)`,
    [
      stats.team.id,
      stats.league.id,
      stats.league.season,

      stats.fixtures.played.total || 0,
      stats.fixtures.played.home || 0,
      stats.fixtures.played.away || 0,

      stats.fixtures.wins.total || 0,
      stats.fixtures.wins.home || 0,
      stats.fixtures.wins.away || 0,

      stats.fixtures.draws.total || 0,
      stats.fixtures.draws.home || 0,
      stats.fixtures.draws.away || 0,

      stats.fixtures.loses.total || 0,
      stats.fixtures.loses.home || 0,
      stats.fixtures.loses.away || 0,

      stats.goals.for.total.total || 0,
      stats.goals.against.total.total || 0,

      stats.failed_to_score.total || 0
    ]
  );
}

// 🔍 Get stats μιας ομάδας από τη βάση
async function getTeamStats(teamId, leagueId, seasonId) {
  const [rows] = await pool.query(
    "SELECT * FROM team_stats WHERE team_id = ? AND league_id = ? AND season_id = ?",
    [teamId, leagueId, seasonId]
  );
  return rows[0];
}

// 🔍 Get όλα τα stats από τη βάση
async function getAllTeamStats() {
  const [rows] = await pool.query("SELECT * FROM team_stats");
  return rows;
}

// ✏️ Update (χειροκίνητα αν χρειάζεται)
async function updateTeamStats(teamId, leagueId, seasonId, updates) {
  await pool.query(
    `UPDATE team_stats
     SET played_total = ?, played_home = ?, played_away = ?,
         wins_total = ?, wins_home = ?, wins_away = ?,
         draws_total = ?, draws_home = ?, draws_away = ?,
         loses_total = ?, loses_home = ?, loses_away = ?,
         goals_for_total = ?, goals_against_total = ?, failed_to_score_total = ?
     WHERE team_id = ? AND league_id = ? AND season_id = ?`,
    [
      updates.played_total, updates.played_home, updates.played_away,
      updates.wins_total, updates.wins_home, updates.wins_away,
      updates.draws_total, updates.draws_home, updates.draws_away,
      updates.loses_total, updates.loses_home, updates.loses_away,
      updates.goals_for_total, updates.goals_against_total, updates.failed_to_score_total,
      teamId, leagueId, seasonId
    ]
  );
}

// ❌ Delete
async function deleteTeamStats(teamId, leagueId, seasonId) {
  await pool.query(
    "DELETE FROM team_stats WHERE team_id = ? AND league_id = ? AND season_id = ?",
    [teamId, leagueId, seasonId]
  );
}

module.exports = {
  insertTeamStats,
  getTeamStats,
  getAllTeamStats,
  updateTeamStats,
  deleteTeamStats
};
