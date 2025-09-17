// src/services/venues/hooks.js
// Hooks for Venues service
// - Public read (find/get) without JWT
// - Write operations (create/patch/remove) require admin
// - Prevent changing read-only fields; timestamps are DB-managed

const { authExternal, requireRoles } = require("../../hooks/common/security");
const { hideFields, preventChanging } = require("../../hooks/common/sanitize");

// Local helper: strip DB-managed timestamps so DB defaults/triggers handle them
const stripTimestamps = () => async (ctx) => {
  if (ctx.data) {
    delete ctx.data.created_at;
    delete ctx.data.updated_at;
  }
  return ctx;
};

module.exports = {
  before: {
    // No global guards
    all: [],

    // ---- READ (public) ----
    find: [], // no auth needed
    get: [], // no auth needed

    // ---- WRITE (admin-only) ----
    create: [
      authExternal(),
      requireRoles(["admin"]),
      preventChanging(["venue_id", "created_at", "updated_at"]),
      stripTimestamps(),
    ],
    patch: [
      authExternal(),
      requireRoles(["admin"]),
      preventChanging(["venue_id", "created_at", "updated_at"]),
      stripTimestamps(),
    ],
    remove: [
      authExternal(),
      requireRoles(["admin"]),
      // NOTE: hard delete by default; swap to soft-delete hook if needed later
    ],
  },

  after: {
    // Hide internal-only fields if/when needed
    all: [hideFields([])],
  },

  error: {
    all: [],
  },
};
