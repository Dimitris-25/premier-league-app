const Venue = require("../../models/teams/venue");


// Εισαγωγή venue από API (αν θέλουμε ξεχωριστό endpoint)
async function fetchAndSaveVenues(req, res) {
  try {
    // εδώ αν το API δίνει venues ξεχωριστά θα κάνουμε request
    // προς το παρόν απλά επιστρέφουμε μήνυμα
    res.json({ message: "✅ Venues endpoint not yet implemented" });
  } catch (err) {
    console.error("❌ Error fetching venues:", err.message);
    res.status(500).json({ error: "Failed to fetch venues" });
  }
}

// Φέρνει όλα τα venues από DB
async function getAllVenues(req, res) {
  try {
    const venues = await getAllVenuesFromDB();
    res.json(venues);
  } catch (err) {
    console.error("❌ Error fetching venues from DB:", err.message);
    res.status(500).json({ error: "Failed to fetch venues from DB" });
  }
}

module.exports = { fetchAndSaveVenues, getAllVenues };
