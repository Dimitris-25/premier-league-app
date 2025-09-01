const express = require("express");
const {
  fetchAndSaveAllTeamStats,
  fetchAndSaveTeamStats,
  getTeamStatsFromDB,
  updateTeamStatsInfo,
  deleteTeamStatsInfo,
} = require("../../controllers/teams/teamsStatsController");

const router = express.Router();

// ✅ Fetch and store all stats (API → DB)
router.get("/import", fetchAndSaveAllTeamStats);

// ✅ Fetch and store stats for a specific team
router.get("/import/:teamId", fetchAndSaveTeamStats);

// ✅ Gets a team's stats from the database
router.get("/:teamId/:leagueId/:seasonId", getTeamStatsFromDB);

// ✅ Update team stats 
router.put("/:teamId/:leagueId/:seasonId", updateTeamStatsInfo);

// ✅ Delete team stats
router.delete("/:teamId/:leagueId/:seasonId", deleteTeamStatsInfo);

module.exports = router;
