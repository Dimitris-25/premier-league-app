// src/services/user/users.hooks.js
// Make sensitive-field masking apply ONLY to external requests,
// so Feathers LocalStrategy can still read password_hash internally.

const bcrypt = require("bcryptjs");
const { protect } = require("@feathersjs/authentication-local").hooks;
const { iff, isProvider } = require("feathers-hooks-common"); // <-- needed

const SALT_ROUNDS = 10;
const TABLE = "users";

function sanitizeUserResult(result) {
  if (!result) return result;
  const clone = { ...result };
  delete clone.password_hash;
  return clone;
}

module.exports = {
  // BEFORE HOOKS
  before: {
    all: [],
    async create(context) {
      const { app, data } = context;
      const knex = app.get("knex");

      // Normalize
      if (data.email) data.email = String(data.email).trim().toLowerCase();
      data.provider = data.provider ? String(data.provider) : "local";

      // Validation
      if (!data.email) throw new Error("Email is required");

      if (data.provider === "local") {
        if (!data.password) throw new Error("Password is required");
        // Hash -> password_hash
        const hash = await bcrypt.hash(String(data.password), SALT_ROUNDS);
        data.password_hash = hash;
        delete data.password;
      } else {
        // Social: ensure no password stored
        delete data.password;
        if (!data.provider_id)
          throw new Error("provider_id is required for social users");
      }

      // Unique email (friendly error before DB blows up)
      const existing = await knex(TABLE).where("email", data.email).first();
      if (existing) {
        const err = new Error("Email already exists");
        err.code = 409;
        throw err;
      }

      return context;
    },

    async patch(context) {
      const { app, id, data, params } = context;
      const knex = app.get("knex");

      // Normalize
      if (data.email) data.email = String(data.email).trim().toLowerCase();

      // If password provided -> re-hash
      if (data.password) {
        const hash = await bcrypt.hash(String(data.password), SALT_ROUNDS);
        data.password_hash = hash;
        delete data.password;
      }

      // Restrict fields for non-admins
      const role = params?.user?.role || "user";
      const isAdmin = role === "admin";
      if (!isAdmin) {
        delete data.role;
        delete data.provider;
        delete data.provider_id;
        delete data.is_active;
      }

      // Ensure email remains unique if changed
      if (data.email) {
        const exists = await knex(TABLE)
          .where("email", data.email)
          .andWhereNot("user_id", id)
          .first();
        if (exists) {
          const err = new Error("Email already exists");
          err.code = 409;
          throw err;
        }
      }

      return context;
    },

    async remove(context) {
      // Soft-delete could be implemented here later.
      return context;
    },
  },

  // AFTER HOOKS
  after: {
    all: [
      // Remove password_hash only in external responses
      iff(isProvider("external"), protect("password_hash")),

      // Our extra sanitize, also only for external responses
      iff(isProvider("external"), async (context) => {
        const { result } = context;

        if (Array.isArray(result)) {
          if (result.every((x) => typeof x === "object")) {
            context.result = result.map(sanitizeUserResult);
          }
        } else if (
          result &&
          Array.isArray(result.data) &&
          typeof result.total !== "undefined"
        ) {
          context.result = {
            ...result,
            data: result.data.map(sanitizeUserResult),
          };
        } else if (result && typeof result === "object") {
          context.result = sanitizeUserResult(result);
        }

        return context;
      }),
    ],
  },

  // ERROR HOOKS
  error: {
    async all(context) {
      const err = context.error;
      const msg = (err?.message || "").toLowerCase();

      // MySQL duplicate → 409
      if (
        err &&
        (err.code === "ER_DUP_ENTRY" ||
          msg.includes("duplicate") ||
          msg.includes("unique") ||
          err.code === 1062)
      ) {
        err.status = 409;
        err.message = "Email already exists";
      }

      throw err;
    },
  },
};
