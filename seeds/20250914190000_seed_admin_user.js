// seeds/20250914190000_seed_admin_user.js
// Seed an admin user (idempotent). Reads credentials from ENV.

const bcrypt = require("bcryptjs");

exports.seed = async function (knex) {
  // -- Read admin credentials from environment (fallback defaults for dev)
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const plain = process.env.ADMIN_PASSWORD || "Admin!234";
  const role = "admin";

  // -- Check if user already exists
  const existing = await knex("users").where({ email }).first();

  // -- Hash password
  const rounds = Number(process.env.BCRYPT_ROUNDS || 10);
  const password_hash = await bcrypt.hash(String(plain), rounds);
  const now = knex.fn.now();

  if (existing) {
    // -- Update existing admin (keeps it idempotent)
    await knex("users").where({ user_id: existing.user_id }).update({
      password_hash,
      role,
      is_active: 1, // if column is TINYINT(1); use true if BOOLEAN
      updated_at: now,
    });
    console.log(`[seed] Updated existing admin: ${email}`);
  } else {
    // -- Insert new admin
    await knex("users").insert({
      email,
      password_hash,
      role,
      is_active: 1,
      provider: "local",
      created_at: now,
      updated_at: now,
    });
    console.log(`[seed] Created admin: ${email}`);
  }
};
