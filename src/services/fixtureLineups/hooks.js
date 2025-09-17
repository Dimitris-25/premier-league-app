// src/services/lineups/hooks.js
// Hooks for FixturesLineups service
// - Public read (find/get)
// - Admin-only write (create/patch/remove)
// - Lock immutable fields: PK + natural key (fixture_id, team_id) + timestamps
// - Strip DB-managed timestamps before write
// - Validate required fields on create

const { authExternal, requireRoles } = require("../../hooks/common/security");
const { hideFields, preventChanging } = require("../../hooks/common/sanitize");

// Remove DB-managed timestamps from incoming payloads
const stripTimestamps = () => async (ctx) => {
  if (ctx.data) {
    delete ctx.data.created_at;
    delete ctx.data.updated_at;
  }
  return ctx;
};

// Enforce required fields on create
const requireOnCreate =
  (fields = []) =>
  async (ctx) => {
    if (ctx.method !== "create") return ctx;
    const missing = fields.filter(
      (f) => ctx.data?.[f] == null || ctx.data?.[f] === ""
    );
    if (missing.length) {
      throw new Error(`Missing required fields: ${missing.join(", ")}`);
    }
    return ctx;
  };

// Immutable fields after insert
const READ_ONLY = [
  "lineup_id", // PK
  "fixture_id", // natural key
  "team_id", // natural key
  "created_at",
  "updated_at",
];

// Required fields on create
const REQUIRED_ON_CREATE = ["fixture_id", "team_id"];

module.exports = {
  before: {
    all: [],
    // ---- READ (public) ----
    find: [],
    get: [],

    // ---- WRITE (admin-only) ----
    create: [
      authExternal(),
      requireRoles(["admin"]),
      requireOnCreate(REQUIRED_ON_CREATE),
      preventChanging(READ_ONLY),
      stripTimestamps(),
    ],
    patch: [
      authExternal(),
      requireRoles(["admin"]),
      preventChanging(READ_ONLY),
      stripTimestamps(),
    ],
    remove: [authExternal(), requireRoles(["admin"])],
  },

  after: {
    // Placeholder: hide sensitive fields if needed later
    all: [hideFields([])],
  },

  error: { all: [] },
};
