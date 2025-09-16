// Hooks for PlayersSeasonStats service
// - Public read (find/get)
// - Admin-only write (create/patch/remove)
// - Lock immutable fields: PK + natural key (player_id, team_id, league_id, season) + timestamps
// - Strip DB-managed timestamps before write

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
    if (missing.length)
      throw new Error(`Missing required fields: ${missing.join(", ")}`);
    return ctx;
  };

// Immutable fields after insert:
// - pss_id (PK)
// - player_id, team_id, league_id, season (natural/composite key in your upsert)
// - created_at, updated_at (DB-managed)
const READ_ONLY = [
  "pss_id",
  "player_id",
  "team_id",
  "league_id",
  "season",
  "created_at",
  "updated_at",
];

module.exports = {
  before: {
    all: [],
    // ---- READ (public) ----
    find: [], // no auth
    get: [], // no auth

    // ---- WRITE (admin-only) ----
    create: [
      authExternal(),
      requireRoles(["admin"]),
      requireOnCreate(["player_id", "team_id", "league_id", "season"]),
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
    // Keep placeholder for future sensitive fields to hide
    all: [hideFields([])],
  },

  error: { all: [] },
};
