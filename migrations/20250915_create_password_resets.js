// migrations/20250915_create_password_resets.js
exports.up = async function (knex) {
  await knex.schema.createTable("password_resets", (t) => {
    t.increments("reset_id").primary().comment("Primary key");
    t.integer("user_id")
      .unsigned()
      .nullable()
      .references("user_id")
      .inTable("users")
      .onUpdate("CASCADE")
      .onDelete("CASCADE")
      .comment("Optional FK to users");
    t.string("email", 255).notNullable().comment("User email");
    t.string("token_hash", 255)
      .notNullable()
      .unique()
      .comment("SHA-256 of the raw token");
    t.timestamp("issued_at").notNullable().defaultTo(knex.fn.now());
    t.timestamp("expires_at").notNullable();
    t.timestamp("used_at").nullable();
    t.string("ip", 45).nullable();
    t.string("user_agent", 255).nullable();

    t.index(["email"], "idx_pr_email");
    t.index(["user_id"], "idx_pr_user");
    t.index(["expires_at"], "idx_pr_expires");
  });
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("password_resets");
};
