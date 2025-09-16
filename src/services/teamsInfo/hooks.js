// Hooks for TeamsInfo service (teamsInfo)
// - Public read (find/get)
// - Admin-only write (create/patch/remove)
// - Lock immutable fields: PK, api_team_id, timestamps
// - Allow nullable FKs (venue_id, country_id) since API/file may miss them

const { authExternal, requireRoles } = require("../../hooks/common/security");
const { hideFields, preventChanging } = require("../../hooks/common/sanitize");

// Strip DB-managed timestamps so DB defaults/triggers handle them
const stripTimestamps = () => async (ctx) => {
  if (ctx.data) {
    delete ctx.data.created_at;
    delete ctx.data.updated_at;
  }
  return ctx;
};

// Validate required fields on create (based on your class logic)
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

// Immutable fields for teamsInfo
// PK + external ID + timestamps should not change after insert
const READ_ONLY = ["team_id", "api_team_id", "created_at", "updated_at"];

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
      requireOnCreate(["api_team_id", "name"]), // required per your upsert logic
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
    // Nothing to hide yet; keep for future (e.g., internal flags)
    all: [hideFields([])],
  },

  error: {
    all: [],
  },
};
