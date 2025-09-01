require("dotenv").config();
// console.log("🔑 API_KEY loaded:", process.env.API_KEY);

const mysql = require("mysql2/promise")
const app = require('./app');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});



