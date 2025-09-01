const express = require("express");
const pool = require("../config/db");
const router = express.Router();
const logger = require("../logger")

// Test route για DB
router.get("/db-test", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 + 1 AS result");
    res.send(`✅ DB Test OK, result: ${rows[0].result}`);
  } catch (err) {
    res.status(500).send("❌ DB Test failed: " + err.message);
  }
});

module.exports = router;
