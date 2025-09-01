const express = require("express");
const { fetchAndSaveTeams, getAllTeams } = require("../controllers/teams/teamsInfoController");

const router = express.Router();

// Import teams from api to DB
router.get("/import", fetchAndSaveTeams);

router.get("/",  getAllTeams);

module.exports = router;

console.log("✅ teamRoutes loaded");
