// Hide fields (after)
const hideFields =
  (fields = []) =>
  async (ctx) => {
    const strip = (obj) => {
      if (!obj || typeof obj !== "object") return obj;
      const clone = { ...obj };
      for (const f of fields) delete clone[f];
      return clone;
    };

    const { result } = ctx;
    if (Array.isArray(result)) ctx.result = result.map(strip);
    else if (result && Array.isArray(result.data))
      ctx.result = { ...result, data: result.data.map(strip) };
    else if (result && typeof result === "object") ctx.result = strip(result);

    return ctx;
  };

// Prevent changes to read-only fields (before create/patch)
const preventChanging =
  (fields = []) =>
  async (ctx) => {
    if (!ctx.data) return ctx;
    for (const f of fields) if (f in ctx.data) delete ctx.data[f];
    return ctx;
  };

// timestamps
const setTimestamps =
  ({ created = true, updated = true } = {}) =>
  async (ctx) => {
    ctx.data = ctx.data || {};
    const now = new Date().toISOString();
    if (created && ctx.method === "create") ctx.data.created_at = now;
    if (updated && (ctx.method === "create" || ctx.method === "patch"))
      ctx.data.updated_at = now;
    return ctx;
  };

module.exports = { hideFields, preventChanging, setTimestamps };
