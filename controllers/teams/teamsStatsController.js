const axios = require("axios");
const { insertTeamStats, getTeamStats, updateTeamStats, deleteTeamStats } = require("../../models/teams/teamsStats");

const { getAllTeamsFromDB } = require("../../models/teams/teamsInfo");
const { insertTeamForm } = require("../../models/teams/teamForm");

const API_KEY = process.env.FOOTBALL_API_KEY;

// ✅ Create/Update: Φέρνει όλα τα stats από το API και τα αποθηκεύει
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAndSaveAllTeamStats(req, res) {
  try {
    const teams = await getAllTeamsFromDB();

    let count = 0;
    // controllers/teams/teamsStatsController.js

  for (let team of teams) {
    count++;
    console.log(`👉 [${count}/${teams.length}] Fetching stats for: ${team.name} (ID: ${team.team_id})`);

    const response = await axios.get("https://v3.football.api-sports.io/teams/statistics", {
      params: { league: 39, season: 2025, team: team.team_id },
      headers: { "x-apisports-key": API_KEY },
    });

    const stats = response.data.response;

    // ✅ Αποθήκευση στα team_stats
    await insertTeamStats(stats);

    // ✅ Αποθήκευση στα team_form
    await insertTeamForm(stats);

    console.log(`✅ [${count}/${teams.length}] Stats + Form saved for: ${team.name}`);

    // Delay για να μην κοπεί από το API
    await delay(300);
  }


    res.json({ message: "✅ All team stats saved to DB!" });
  } catch (err) {
    console.error("❌ Error fetching team stats:", err.message);
    res.status(500).json({ error: "Failed to fetch all team stats" });
  }
}



// ✅ Create/Update: Φέρνει stats για μια συγκεκριμένη ομάδα
async function fetchAndSaveTeamStats(req, res) {
  const { teamId } = req.params;

  try {
    const response = await axios.get("https://v3.football.api-sports.io/teams/statistics", {
      params: { league: 39, season: 2025, team: teamId },
      headers: { "x-apisports-key": API_KEY },
    });

    const stats = response.data.response;
    await insertTeamStats(stats);

    res.json({ message: `✅ Stats saved for team ${teamId}` });
  } catch (err) {
    console.error("❌ Error fetching stats for team:", err.message);
    res.status(500).json({ error: "Failed to fetch team stats" });
  }
}

// ✅ Read: Παίρνει stats μιας ομάδας από τη DB
async function getTeamStatsFromDB(req, res) {
  const { teamId, leagueId, seasonId } = req.params;

  try {
    const stats = await getTeamStats(teamId, leagueId, seasonId);
    if (!stats) {
      return res.status(404).json({ error: "⚠️ No stats found for this team" });
    }
    res.json(stats);
  } catch (err) {
    console.error("❌ Error fetching team stats from DB:", err.message);
    res.status(500).json({ error: "Failed to fetch team stats from DB" });
  }
}

// ✅ Update: Ενημερώνει stats μιας ομάδας
async function updateTeamStatsInfo(req, res) {
  const { teamId, leagueId, seasonId } = req.params;

  try {
    const result = await updateTeamStats(teamId, leagueId, seasonId, req.body);
    res.status(200).json({ status: true, data: result });
  } catch (err) {
    console.error("❌ Error updating team stats:", err.message);
    res.status(400).json({ status: false, error: err.message });
  }
}

// ✅ Delete: Διαγράφει stats μιας ομάδας
async function deleteTeamStatsInfo(req, res) {
  const { teamId, leagueId, seasonId } = req.params;

  try {
    const result = await deleteTeamStats(teamId, leagueId, seasonId);
    res.status(200).json({ status: true, data: result });
  } catch (err) {
    console.error("❌ Error deleting team stats:", err.message);
    res.status(400).json({ status: false, error: err.message });
  }
}

module.exports = {
  fetchAndSaveAllTeamStats,
  fetchAndSaveTeamStats,
  getTeamStatsFromDB,
  updateTeamStatsInfo,
  deleteTeamStatsInfo,
};
