const axios = require("axios");

// 🎯 Από το teamsInfo model
const {
  insertTeam,
  getAllTeamsFromDB,
  getTeamById,
  updateTeam,
  deleteTeam
} = require("../../models/teams/teamsInfo");

// 🎯 Από το venue model
const {
  insertVenue,
  updateVenue,
  deleteVenue,
  getVenueById
} = require("../../models/teams/venue");

const API_KEY = process.env.FOOTBALL_API_KEY;

// ✅ Create/Update: Φέρνει ομάδες από API και τις αποθηκεύει στη DB
async function fetchAndSaveTeams(req, res) {
  try {
    const response = await axios.get("https://v3.football.api-sports.io/teams", {
      params: { league: 39, season: 2025 },
      headers: { "x-apisports-key": API_KEY },
    });

    const teams = response.data.response;

    for (let item of teams) {
      // 1. Αποθήκευση Venue
      await insertVenue(item.venue);
      // 2. Αποθήκευση Team με reference στο venue
      await insertTeam(item.team, item.venue.id);
    }

    res.json({ message: "✅ Teams saved to DB!" });
  } catch (err) {
    console.error("❌ Error fetching teams:", err.message);
    res.status(500).json({ error: "Failed to fetch teams" });
  }
}

// ✅ Read: Παίρνει όλες τις ομάδες
async function getAllTeams(req, res) {
  try {
    const teams = await getAllTeamsFromDB();
    res.json(teams);
  } catch (err) {
    console.error("❌ Error fetching teams from DB:", err.message);
    res.status(500).json({ error: "Failed to fetch teams from DB" });
  }
}

// ✅ Read: Παίρνει μία ομάδα με βάση το teamId
async function getTeam(req, res) {
  const { teamId } = req.params;
  try {
    const team = await getTeamById(teamId);
    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }
    res.json(team);
  } catch (err) {
    console.error("❌ Error fetching team:", err.message);
    res.status(500).json({ error: "Failed to fetch team" });
  }
}

// ✅ Update: Ενημερώνει στοιχεία μιας ομάδας
async function updateTeamInfo(req, res) {
  const { teamId } = req.params;
  const { name, code, country, founded, logo, venue_id } = req.body;

  try {
    const result = await updateTeam(teamId, { name, code, country, founded, logo, venue_id });
    res.status(200).json({ status: true, data: result });
  } catch (err) {
    console.error("❌ Error updating team:", err.message);
    res.status(400).json({ status: false, error: err.message });
  }
}

// ✅ Delete: Διαγράφει μια ομάδα
async function deleteTeamInfo(req, res) {
  const { teamId } = req.params;

  try {
    const result = await deleteTeam(teamId);
    res.status(200).json({ status: true, data: result });
  } catch (err) {
    console.error("❌ Error deleting team:", err.message);
    res.status(400).json({ status: false, error: err.message });
  }
}

module.exports = {
  fetchAndSaveTeams,
  getAllTeams,
  getTeam,
  updateTeamInfo,
  deleteTeamInfo,
};
