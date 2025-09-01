const express = require("express");
const {
  fetchAndSaveAllTeamForms,
  fetchAndSaveTeamForm,
  getTeamFormFromDB,
  updateTeamFormInfo,
  deleteTeamFormInfo
} = require("../../controllers/teams/teamFormController");

const router = express.Router();

// ✅ Import for all teams
router.get("/import", fetchAndSaveAllTeamForms);

// ✅ Import for one team
router.get("/import/:teamId", fetchAndSaveTeamForm);

// ✅ Get form drom DB
router.get("/:teamId/:leagueId/:seasonId", getTeamFormFromDB);

// ✅ Update
router.put("/:teamId/:leagueId/:seasonId", updateTeamFormInfo);

// ✅ Delete
router.delete("/:teamId/:leagueId/:seasonId", deleteTeamFormInfo);

module.exports = router;
