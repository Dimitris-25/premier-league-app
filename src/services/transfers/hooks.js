// src/services/transfers/hooks.js
// Hooks for Transfers service
// - Public READ (find/get) without JWT
// - WRITE (create/patch/remove) requires admin
// - Protect read-only fields; DB handles timestamps
// - Log errors to console for quick debugging

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

// Minimal error logger (keeps terminal helpful without leaking secrets)
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
    find: [], // no auth
    get: [], // no auth

    // ---- WRITE (admin-only) ----
    create: [
      authExternal(),
      requireRoles(["admin"]),
      preventChanging(["transfer_id", "created_at", "updated_at"]),
      stripTimestamps(),
    ],
    patch: [
      authExternal(),
      requireRoles(["admin"]),
      preventChanging(["transfer_id", "created_at", "updated_at"]),
      stripTimestamps(),
    ],
    remove: [authExternal(), requireRoles(["admin"])],
  },

  after: {
    // Hide internal-only fields here if χρειαστεί (π.χ. audit fields)
    all: [hideFields([])],
  },

  error: {
    all: [logHookError("transfers")],
  },
};
