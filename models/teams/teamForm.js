const pool = require("../../config/db");

// ➕ Insert ή Update στο team_form
async function insertTeamForm(stats) {
  const sql = `
    INSERT INTO team_form (
      team_id, league_id, season_id,
      form, streak_wins, streak_draws, streak_losses,
      updated_at
    ) VALUES (?,?,?,?,?,?,?, NOW())
    ON DUPLICATE KEY UPDATE
      form = VALUES(form),
      streak_wins = VALUES(streak_wins),
      streak_draws = VALUES(streak_draws),
      streak_losses = VALUES(streak_losses),
      updated_at = NOW()
  `;

  const values = [
    stats.team.id,
    stats.league.id,
    stats.league.season,

    stats.form || null,
    stats.biggest?.streak?.wins || 0,
    stats.biggest?.streak?.draws || 0,
    stats.biggest?.streak?.losses || 0,
  ];

  await pool.query(sql, values);
}

// 🔍 Get form για μια ομάδα
async function getTeamForm(teamId, leagueId, seasonId) {
  const sql = "SELECT * FROM team_form WHERE team_id = ? AND league_id = ? AND season_id = ?";
  const [rows] = await pool.query(sql, [teamId, leagueId, seasonId]);
  return rows[0];
}

// 🔍 Get όλα τα forms
async function getAllTeamForms() {
  const sql = "SELECT * FROM team_form";
  const [rows] = await pool.query(sql);
  return rows;
}

// ✏️ Update (αν θέλεις manual)
async function updateTeamForm(teamId, leagueId, seasonId, updates) {
  const sql = `
    UPDATE team_form
    SET form = ?, streak_wins = ?, streak_draws = ?, streak_losses = ?, updated_at = NOW()
    WHERE team_id = ? AND league_id = ? AND season_id = ?
  `;

  const values = [
    updates.form,
    updates.streak_wins,
    updates.streak_draws,
    updates.streak_losses,
    teamId, leagueId, seasonId,
  ];

  await pool.query(sql, values);
}

// ❌ Delete
async function deleteTeamForm(teamId, leagueId, seasonId) {
  const sql = "DELETE FROM team_form WHERE team_id = ? AND league_id = ? AND season_id = ?";
  await pool.query(sql, [teamId, leagueId, seasonId]);
}

module.exports = {
  insertTeamForm,
  getTeamForm,
  getAllTeamForms,
  updateTeamForm,
  deleteTeamForm,
};
