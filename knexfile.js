// knexfile.js
require("dotenv").config();

const base = {
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  pool: { min: 0, max: 10 },
  migrations: { directory: "./migrations", tableName: "knex_migrations" },
  seeds: { directory: "./seeds" },
};

module.exports = {
  development: base,
  // production: { ...base, connection: { ...base.connection, host: '...' } }
};
