const express = require("express");
const router = express.Router();

router.use("/", require("./leaguesRoutes"));

module.exports = router;
