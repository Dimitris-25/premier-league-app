// src/services/countries/hooks.js
// Hooks for Countries service
// - Public read (find/get) without JWT
// - Write operations (create/patch/remove) require admin
// - Prevent changing read-only fields (PK, code, timestamps)
// - Strip DB-managed timestamps from incoming payloads
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

// Read-only fields: PK + code + timestamps
// NOTE: If your PK is not `country_id`, change it here.
const READ_ONLY = ["country_id", "code", "created_at", "updated_at"];

// Required fields on create
const REQUIRED_ON_CREATE = ["code", "name"];

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
    all: [hideFields([])],
  },

  error: {
    all: [],
  },
};
