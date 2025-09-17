// src/services/coaches/hooks.js
// Hooks for Coaches service
// - Public read (find/get) without JWT
// - Admin-only writes (create/patch/remove)
// - Prevent changing read-only fields (PK, api_coach_id, timestamps)
// - Strip DB-managed timestamps from payloads
// - Require mandatory fields on create

const { authExternal, requireRoles } = require("../../hooks/common/security");
const { hideFields, preventChanging } = require("../../hooks/common/sanitize");

// Remove DB-managed timestamps from input
const stripTimestamps = () => async (context) => {
  if (context.data) {
    delete context.data.created_at;
    delete context.data.updated_at;
  }
  return context;
};

// Validate required fields on create
const requireOnCreate =
  (fields = []) =>
  async (context) => {
    if (context.method !== "create") return context;
    const missing = fields.filter(
      (f) => context.data?.[f] == null || context.data?.[f] === ""
    );
    if (missing.length) {
      throw new Error(`Missing required fields: ${missing.join(", ")}`);
    }
    return context;
  };

// Read-only fields (adjust PK if different)
const READ_ONLY = ["coach_id", "api_coach_id", "created_at", "updated_at"];

// Required fields on create
const REQUIRED_ON_CREATE = ["api_coach_id", "name"];

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
    // Hide nothing for now; placeholder for future fields
    all: [hideFields([])],
  },

  error: { all: [] },
};
