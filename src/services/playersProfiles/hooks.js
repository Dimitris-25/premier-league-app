// Hooks for PlayersProfiles service
// - Public read (find/get)
// - Admin-only write (create/patch/remove)
// - Protect immutable fields (PK + api_player_id + timestamps)
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

// Immutable fields for playersProfiles
const READ_ONLY = ["player_id", "api_player_id", "created_at", "updated_at"];

module.exports = {
  before: {
    all: [],
    // --- READ (public) ---
    find: [], // public
    get: [], // public

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
    // Nothing sensitive yet; keep hook for possible hidden fields later
    all: [hideFields([])],
  },

  error: {
    all: [],
  },
};
