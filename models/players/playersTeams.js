const pool = require("../../config/db");

// ➕ Insert ή Update player-team σχέση
async function insertPlayerTeam(playerTeam) {
  const sql = `
    INSERT INTO players_teams (
      player_id, team_id, season
    ) VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE
      season = VALUES(season)
  `;

  const values = [
    playerTeam.player_id,
    playerTeam.team_id,
    playerTeam.season,
  ];

  await pool.query(sql, values);
}

// 📖 Fetch όλες τις ομάδες ενός παίκτη
async function fetchTeamsByPlayer(player_id) {
  const sql = "SELECT * FROM players_teams WHERE player_id = ?";
  const [rows] = await pool.query(sql, [player_id]);
  return rows;
}

// 📖 Fetch όλους τους players-teams
async function fetchAllPlayersTeams() {
  const sql = "SELECT * FROM players_teams";
  const [rows] = await pool.query(sql);
  return rows;
}

// ✏️ Update player-team
async function updatePlayerTeam(playerTeam) {
  const sql = `
    UPDATE players_teams
    SET season = ?
    WHERE player_id = ? AND team_id = ?
  `;

  const values = [
    playerTeam.season,
    playerTeam.player_id,
    playerTeam.team_id,
  ];

  const [result] = await pool.query(sql, values);
  return result;
}

// ❌ Delete player-team
async function deletePlayerTeam(player_id, team_id) {
  const sql = "DELETE FROM players_teams WHERE player_id = ? AND team_id = ?";
  const [result] = await pool.query(sql, [player_id, team_id]);
  return result;
}

module.exports = {
  insertPlayerTeam,
  fetchTeamsByPlayer,
  fetchAllPlayersTeams,
  updatePlayerTeam,
  deletePlayerTeam,
};
