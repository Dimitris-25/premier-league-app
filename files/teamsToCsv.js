const fs = require("fs");
const { Parser } = require("json2csv");

// 1. Διαβάζουμε το teams.json
const data = JSON.parse(fs.readFileSync(__dirname + "/teams.json", "utf8"));

// 2. Παίρνουμε τα πεδία που μας ενδιαφέρουν
const teams = data.response.map(item => ({
  id: item.team.id,
  name: item.team.name,
  code: item.team.code,
  country: item.team.country,
  founded: item.team.founded,
  stadium: item.venue.name,
  city: item.venue.city,
  capacity: item.venue.capacity
}));

// 3. Μετατροπή σε CSV
const parser = new Parser();
const csv = parser.parse(teams);

// 4. Αποθήκευση στο Desktop (έξω από το project)
fs.writeFileSync("C:/Users/user/Desktop/FinalProject/teams.csv", csv);

console.log("✅ CSV created on Desktop!");
