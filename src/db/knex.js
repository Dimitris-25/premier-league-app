// Single Knex client (MySQL) shared across the app

require("dotenv").config();
const knex = require("knex");

const knexClient = knex({
  client: "mysql2",
  connection: {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
  pool: {
    min: 0,
    max: 50,
    // Tip: tune pool sizes later if needed (ingest vs. API traffic)
  },
});

/**
 * Simple connectivity check. Use it in a startup probe if desired.
 * Example: await healthCheck();
 */
async function healthCheck() {
  await knexClient.raw("SELECT 1");
}

/**
 * Graceful shutdown: close DB pool when process exits.
 * (Feathers/Express will stop listening; we also release DB connections.)
 */
process.on("SIGINT", async () => {
  try {
    await knexClient.destroy();
  } finally {
    process.exit(0);
  }
});
process.on("SIGTERM", async () => {
  try {
    await knexClient.destroy();
  } finally {
    process.exit(0);
  }
});

module.exports = { knexClient, healthCheck };
