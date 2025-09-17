// Hooks for PlayersTopStats service
// - Public read (find/get)
// - Admin-only write (create/patch/remove)
// - Protect immutable fields (PK + timestamps)
// - Strip DB-managed timestamps before write

const { authExternal, requireRoles } = require("../../hooks/common/security");
const { hideFields, preventChanging } = require("../../hooks/common/sanitize");

// Helper: remove DB-managed timestamps from input data
const stripTimestamps = () => async (ctx) => {
  if (ctx.data) {
    delete ctx.data.created_at;
    delete ctx.data.updated_at;
  }
  return ctx;
};

// Immutable fields for playersTopStats
// PK + timestamps should not be changed by clients
const READ_ONLY = ["topstat_id", "created_at", "updated_at"];

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
    // Nothing sensitive to hide yet
    all: [hideFields([])],
  },

  error: {
    all: [],
  },
};
