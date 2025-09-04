const fs = require("fs");
const path = require("path");

// Load all profiles
const allProfiles = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../files/playersProfilesAll.json"), "utf8")
);

// Player ID που θέλεις να ψάξεις
const targetId = 3269;

// Ψάχνουμε μέσα στο αρχείο
const found = allProfiles.find(p => p.player && p.player.id === targetId);

if (found) {
  console.log("✅ Found player in profiles:", found.player.firstname, found.player.lastname, "ID:", found.player.id);
} else {
  console.log("❌ Player ID not found:", targetId);
}
