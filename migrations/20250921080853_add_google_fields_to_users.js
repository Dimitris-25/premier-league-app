// migrations/20250921080853_add_google_fields_to_users.js
exports.up = async function (knex) {
  // Προσθέτουμε κάθε στήλη μόνο αν λείπει
  const hasGoogleId = await knex.schema.hasColumn("users", "google_id");
  if (!hasGoogleId) {
    await knex.schema.alterTable("users", (t) => {
      t.string("google_id", 64).unique().nullable().after("email");
    });
  }

  const hasGoogleName = await knex.schema.hasColumn("users", "google_name");
  if (!hasGoogleName) {
    await knex.schema.alterTable("users", (t) => {
      t.string("google_name", 120).nullable().after("google_id");
    });
  }

  const hasGooglePicture = await knex.schema.hasColumn(
    "users",
    "google_picture"
  );
  if (!hasGooglePicture) {
    await knex.schema.alterTable("users", (t) => {
      t.string("google_picture", 255).nullable().after("google_name");
    });
  }
};

exports.down = async function (knex) {
  // Κάνε drop μόνο αν υπάρχουν (ώστε να μη σκάει)
  const hasPic = await knex.schema.hasColumn("users", "google_picture");
  if (hasPic) {
    await knex.schema.alterTable("users", (t) =>
      t.dropColumn("google_picture")
    );
  }

  const hasName = await knex.schema.hasColumn("users", "google_name");
  if (hasName) {
    await knex.schema.alterTable("users", (t) => t.dropColumn("google_name"));
  }

  const hasId = await knex.schema.hasColumn("users", "google_id");
  if (hasId) {
    await knex.schema.alterTable("users", (t) => t.dropColumn("google_id"));
  }
};
