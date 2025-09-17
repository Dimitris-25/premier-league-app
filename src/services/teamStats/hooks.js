// src/services/teams-stats-files/hooks.js
// Hooks for TeamsStats (file-based importer)
// - Public READ (find/get) without JWT
// - WRITE (create/patch/remove) requires admin
// - Protect read-only/system fields; DB handles timestamps
// - Console-log errors for quick debugging

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

// Minimal error logger (do not leak secrets)
const logHookError = (label) => async (ctx) => {
  const e = ctx.error;
  console.error(`[HOOK ERROR] ${label}`, {
    path: ctx.path,
    method: ctx.method,
    type: ctx.type, // before/after/error
    code: e?.code || e?.status || 500,
    message: e?.message,
  });
  return ctx;
};

module.exports = {
  before: {
    all: [],

    // ---- READ (public) ----
    find: [], // public
    get: [], // public

    // ---- WRITE (admin-only) ----
    create: [
      authExternal(),
      requireRoles(["admin"]),
      preventChanging(["stats_id", "created_at", "updated_at"]),
      stripTimestamps(),
    ],
    patch: [
      authExternal(),
      requireRoles(["admin"]),
      preventChanging(["stats_id", "created_at", "updated_at"]),
      stripTimestamps(),
    ],
    remove: [authExternal(), requireRoles(["admin"])],
  },

  after: {
    // Hide internal-only fields if needed later
    all: [hideFields([])],
  },

  error: {
    all: [logHookError("teams-stats-files")],
  },
};
