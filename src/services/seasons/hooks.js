// src/services/seasons/hooks.js
// Hooks for Seasons service
// - Public read (find/get)
// - Admin-only write (create/patch/remove)
// - Prevent modifying immutable fields (PK, api_season_id, timestamps)

const { authExternal, requireRoles } = require("../../hooks/common/security");
const { hideFields, preventChanging } = require("../../hooks/common/sanitize");

// Remove DB-managed timestamps so DB handles them
const stripTimestamps = () => async (ctx) => {
  if (ctx.data) {
    delete ctx.data.created_at;
    delete ctx.data.updated_at;
  }
  return ctx;
};

// Immutable fields for seasons
const READ_ONLY = ["season_id", "api_season_id", "created_at", "updated_at"];

module.exports = {
  before: {
    all: [],
    // --- READ (public) ---
    find: [], // no auth
    get: [], // no auth

    // --- WRITE (admin-only) ---
    create: [
      authExternal(),
      requireRoles(["admin"]),
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
    // Nothing to hide for now, but hook is ready
    all: [hideFields([])],
  },

  error: {
    all: [],
  },
};
