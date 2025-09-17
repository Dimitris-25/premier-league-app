// src/services/events/hooks.js
// Hooks για Events
// - Δημόσιο read (find/get)
// - Admin-only write (create/patch/remove)
// - Κλείδωμα πεδίων: PK + fixture_id + timestamps
// - Αφαίρεση DB-managed timestamps από εισερχόμενα payloads
// - Υποχρεωτικά πεδία στο create

const { authExternal, requireRoles } = require("../../hooks/common/security");
const { hideFields, preventChanging } = require("../../hooks/common/sanitize");

// Αφαίρεση timestamps που τα διαχειρίζεται η ΒΔ
const stripTimestamps = () => async (ctx) => {
  if (ctx.data) {
    delete ctx.data.created_at;
    delete ctx.data.updated_at;
  }
  return ctx;
};

// Έλεγχος υποχρεωτικών πεδίων στο create
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

// Μη μεταβαλλόμενα πεδία μετά την εισαγωγή
const READ_ONLY = ["event_id", "fixture_id", "created_at", "updated_at"];

// Υποχρεωτικά πεδία στη δημιουργία
const REQUIRED_ON_CREATE = ["fixture_id", "time_elapsed", "type", "detail"];

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
