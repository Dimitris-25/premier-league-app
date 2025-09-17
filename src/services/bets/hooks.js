// src/services/bets/hooks.js
// Hooks for Bets service
// - Public read (find/get)
// - Admin-only write (create/patch/remove)
// - Prevent changing read-only fields; strip DB-managed timestamps
// - Require mandatory fields on create

const { authExternal, requireRoles } = require("../../hooks/common/security");
const { hideFields, preventChanging } = require("../../hooks/common/sanitize");

// Remove DB-managed timestamps from input
const stripTimestamps = () => async (ctx) => {
  if (ctx.data) {
    delete ctx.data.created_at;
    delete ctx.data.updated_at;
  }
  return ctx;
};

// Require fields on create
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

// Read-only fields
const READ_ONLY = ["bet_id", "api_bet_id", "created_at", "updated_at"];

// Required on create
const REQUIRED_ON_CREATE = ["api_bet_id", "name"];

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

  error: { all: [] },
};
