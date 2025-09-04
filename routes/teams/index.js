const express = require("express");
const router = express.Router();

router.use("/", require("./teamRoutes"));
router.use("/form", require("./teamFormRoutes"));
router.use("/players", require("./teamPlayersRoutes"));
router.use("/stats", require("./teamsStatsRoutes"));
router.use("/venues", require("./venueRoutes"));

module.exports = router;
