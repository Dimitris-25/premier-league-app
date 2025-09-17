const { authenticate } = require("@feathersjs/authentication").hooks;

const when =
  (predicate, ...hooks) =>
  async (ctx) => {
    if (await predicate(ctx)) for (const h of hooks) await h(ctx);
    return ctx;
  };
const isExternal = (ctx) => !!ctx.params.provider;

// JWT for outcalls
const authExternal = () => when(isExternal, authenticate("jwt"));

// Roles
const requireRoles =
  (roles = ["admin"], { roleField = "role" } = {}) =>
  async (ctx) => {
    if (!isExternal(ctx)) return ctx;
    const userRole = ctx.params?.user?.[roleField];
    if (!roles.includes(userRole)) {
      const err = new Error("Forbidden");
      err.code = 403;
      throw err;
    }
    return ctx;
  };

// Admin
const restrictToOwner =
  ({
    ownerField = "user_id",
    idField = "id",
    allowAdmin = true,
    roleField = "role",
    adminValue = "admin",
  } = {}) =>
  async (ctx) => {
    if (!isExternal(ctx)) return ctx;

    const isAdmin = allowAdmin && ctx.params?.user?.[roleField] === adminValue;
    if (isAdmin) return ctx;

    const userId = ctx.params?.user?.user_id ?? ctx.params?.user?.id;
    if (!userId) {
      const e = new Error("Forbidden");
      e.code = 403;
      throw e;
    }

    // patch
    if (ctx.id != null) {
      const current = await ctx.service.get(ctx.id, {
        ...ctx.params,
        provider: undefined,
      });
      if (current?.[ownerField] !== userId) {
        const e = new Error("Forbidden (not owner)");
        e.code = 403;
        throw e;
      }
    } else {
      // admin
      ctx.params.query = { ...(ctx.params.query || {}), [ownerField]: userId };
    }
    return ctx;
  };

// Autorized methos
const limitExternalMethods =
  (allowed = []) =>
  async (ctx) => {
    if (!isExternal(ctx)) return ctx;
    const method = ctx.method;
    if (!allowed.includes(method)) {
      const e = new Error("Method not allowed");
      e.code = 405;
      throw e;
    }
    return ctx;
  };

module.exports = {
  authExternal,
  requireRoles,
  restrictToOwner,
  limitExternalMethods,
  when,
  isExternal,
};
