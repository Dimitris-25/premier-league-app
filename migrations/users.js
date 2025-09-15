// migrations/20250914_create_users.js
exports.up = async function (knex) {
  await knex.schema.createTable("users", (table) => {
    // PK
    table.increments("user_id").primary().comment("Primary key");

    // Login key (unique πάντα)
    table
      .string("email", 150)
      .notNullable()
      .unique()
      .comment("User email (unique, used for login)");

    // Για local login μόνο – NULL σε social
    table
      .string("password_hash", 255)
      .nullable()
      .comment("Hashed password for local users (NULL for social)");

    // RBAC
    table
      .string("role", 50)
      .notNullable()
      .defaultTo("user")
      .comment("Role: 'user' | 'admin' ...");

    // Soft-disable
    table
      .boolean("is_active")
      .notNullable()
      .defaultTo(true)
      .comment("Active flag");

    // Social login info
    table
      .string("provider", 50)
      .notNullable()
      .defaultTo("local")
      .comment("Auth provider: 'local' | 'google' | ...");
    table
      .string("provider_id", 150)
      .nullable()
      .comment("External provider user id (e.g., Google sub)");

    // Τελευταίο επιτυχές login
    table.timestamp("last_login").nullable().comment("Last successful login");

    // Timestamps
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());

    // Προαιρετικά: μοναδικότητα provider+provider_id για social λογαριασμούς
    table.unique(["provider", "provider_id"], {
      indexName: "uq_users_provider_provider_id",
      useConstraint: true,
    });
  });

  // Προαιρετικά για MySQL: updated_at ON UPDATE CURRENT_TIMESTAMP
  // αν το θες αυτόματο update του updated_at:
  await knex.schema.raw(`
    ALTER TABLE users
    MODIFY COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  `);
};

exports.down = async function (knex) {
  await knex.schema.dropTableIfExists("users");
};
