const express = require("express");
const router = express.Router();

router.use("/rounds", require("./roundsRoutes"))

module.exports = router;
