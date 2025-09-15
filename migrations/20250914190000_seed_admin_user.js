const bcrypt = require("bcryptjs");

exports.up = async function (knex) {
  const email = "fenomeno979@gmail.com";
  const password = "Mnbvcxzqwert12345555@@@@";
  const passwordHash = await bcrypt.hash(password, 10);

  const existing = await knex("users").where({ email }).first();

  if (!existing) {
    await knex("users").insert({
      email,
      password_hash: passwordHash,
      role: "admin",
      is_active: true,
      provider: "local",
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    });
    console.log("✅ Admin user created:", email);
  } else {
    console.log("ℹ️ Admin user already exists:", email);
  }
};

exports.down = async function (knex) {
  const email = "admin@example.com";
  await knex("users").where({ email }).del();
  console.log("🗑️ Admin user removed:", email);
};
