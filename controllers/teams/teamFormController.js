const axios = require("axios");
const {
  insertTeamForm,
  getTeamForm,
  getAllTeamForms,
  updateTeamForm,
  deleteTeamForm
} = require("../../models/teams/teamForm");

const { getAllTeamsFromDB } = require("../../models/teams/teamsInfo");

const API_KEY = process.env.FOOTBALL_API_KEY;

// 🔹 Helper για delay
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ➕ Import form για όλες τις ομάδες
async function fetchAndSaveAllTeamForms(req, res) {
  try {
    const teams = await getAllTeamsFromDB();

    let count = 0;
    for (let team of teams) {
      count++;
      console.log(`👉 [${count}/${teams.length}] Fetching form for: ${team.name} (ID: ${team.team_id})`);

      const response = await axios.get("https://v3.football.api-sports.io/teams/statistics", {
        params: { league: 39, season: 2025, team: team.team_id },
        headers: { "x-apisports-key": API_KEY },
      });

      const stats = response.data.response;
      await insertTeamForm(stats);

      console.log(`✅ [${count}/${teams.length}] Saved form for: ${team.name}`);

      // 🔹 Delay 300ms για να μην χτυπάει limit το API
      await delay(300);
    }

    res.json({ message: "✅ All team forms saved to DB!" });
  } catch (err) {
    console.error("❌ Error fetching team forms:", err.message);
    res.status(500).json({ error: "Failed to fetch team forms" });
  }
}

// ➕ Import form για μία ομάδα
async function fetchAndSaveTeamForm(req, res) {
  const { teamId } = req.params;

  try {
    const response = await axios.get("https://v3.football.api-sports.io/teams/statistics", {
      params: { league: 39, season: 2025, team: teamId },
      headers: { "x-apisports-key": API_KEY },
    });

    const stats = response.data.response;
    await insertTeamForm(stats);

    res.json({ message: `✅ Form saved for team ${teamId}` });
  } catch (err) {
    console.error("❌ Error fetching team form:", err.message);
    res.status(500).json({ error: "Failed to fetch team form" });
  }
}

// 🔍 Get από DB
async function getTeamFormFromDB(req, res) {
  const { teamId, leagueId, seasonId } = req.params;

  try {
    const form = await getTeamForm(teamId, leagueId, seasonId);
    if (!form) {
      return res.status(404).json({ error: "⚠️ No form found for this team" });
    }
    res.json(form);
  } catch (err) {
    console.error("❌ Error fetching team form from DB:", err.message);
    res.status(500).json({ error: "Failed to fetch team form from DB" });
  }
}

// ✏️ Update
async function updateTeamFormInfo(req, res) {
  const { teamId, leagueId, seasonId } = req.params;

  try {
    const result = await updateTeamForm(teamId, leagueId, seasonId, req.body);
    res.status(200).json({ status: true, data: result });
  } catch (err) {
    console.error("❌ Error updating team form:", err.message);
    res.status(400).json({ status: false, error: err.message });
  }
}

// ❌ Delete
async function deleteTeamFormInfo(req, res) {
  const { teamId, leagueId, seasonId } = req.params;

  try {
    const result = await deleteTeamForm(teamId, leagueId, seasonId);
    res.status(200).json({ status: true, data: result });
  } catch (err) {
    console.error("❌ Error deleting team form:", err.message);
    res.status(400).json({ status: false, error: err.message });
  }
}

module.exports = {
  fetchAndSaveAllTeamForms,
  fetchAndSaveTeamForm,
  getTeamFormFromDB,
  updateTeamFormInfo,
  deleteTeamFormInfo,
};
