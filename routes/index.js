const express = require("express");
const router = express.Router();

// Grouped routes by domain
router.use("/players", require("./players"));
router.use("/teams", require("./teams"));
router.use("/leagues", require("./leagues"));
router.use("/fixtures", require("./fixtures"));

module.exports = router;
