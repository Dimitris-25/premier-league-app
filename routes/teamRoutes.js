const express = require("express");
const { fetchAndSaveTeams } = require("../model/teamsModel");
const pool = require("../db"); // για query στη MySQL

const router = express.Router();

// Route για import ομάδων Premier League 25/26
router.get("/import-teams", async (req, res) => {
  try {
    await fetchAndSaveTeams();
    res.send("✅ Teams 25/26 imported into DB!");
  } catch (err) {
    console.error("❌ Error in /import-teams:", err.message);
    res.status(500).send("Error importing teams");
  }
});

// GET /teams → return teams from mysql database
router.get("/teams", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM teams");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching teams from DB:", err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;
