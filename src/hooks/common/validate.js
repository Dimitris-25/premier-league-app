// src/hooks/common/validate.js
// Reusable Zod-based validators for Feathers hooks.
// Usage:
//   const { validateCreate, validatePatch } = require('../../hooks/common/validate');
//   before: { create: [validateCreate(zUserCreate)], patch: [validatePatch(zUserPatch)] }
//
// Notes:
// - Expects Zod schemas (https://zod.dev). Falls back to no-op if no schema is provided.
// - Converts Zod errors into Feathers BadRequest with compact `issues` payload.

const { BadRequest } = require("@feathersjs/errors");

// Try to detect a Zod schema (duck typing)
function isZodSchema(s) {
  return !!s && typeof s.safeParse === "function";
}

// Normalize Zod issues for client-friendly errors
function normalizeIssues(zodError) {
  try {
    return zodError.issues.map((i) => ({
      code: i.code,
      path: Array.isArray(i.path) ? i.path.join(".") : String(i.path || ""),
      message: i.message,
    }));
  } catch {
    return [{ message: "Invalid input" }];
  }
}

/**
 * Validate ctx.data for CREATE operations.
 * - Applies the given Zod schema as-is (you can compose/transform inside your schema).
 * - On success: replaces ctx.data with the parsed (possibly transformed) value.
 * - On failure: throws BadRequest with { issues }.
 */
function validateCreate(schema, { unknown = "strip" } = {}) {
  return async (context) => {
    if (!schema || !isZodSchema(schema)) return context;

    // Optional unknown-keys behavior for object schemas
    let effective = schema;
    if (typeof schema.strict === "function") {
      if (unknown === "strict" && typeof schema.strict === "function")
        effective = schema.strict();
      if (unknown === "passthrough" && typeof schema.passthrough === "function")
        effective = schema.passthrough();
      if (unknown === "strip" && typeof schema.strip === "function")
        effective = schema.strip(); // Zod default
    }

    const parsed = effective.safeParse(context.data);
    if (!parsed.success) {
      throw new BadRequest("Validation failed", {
        issues: normalizeIssues(parsed.error),
      });
    }
    context.data = parsed.data;
    return context;
  };
}

/**
 * Validate ctx.data for PATCH operations.
 * - By default validates with a partial() view of the given schema.
 * - On success: replaces ctx.data with the parsed (possibly transformed) value.
 * - On failure: throws BadRequest with { issues }.
 */
function validatePatch(schema, { partial = true, unknown = "strip" } = {}) {
  return async (context) => {
    if (!schema || !isZodSchema(schema)) return context;

    // Partial schema for PATCH (if supported)
    let effective =
      partial && typeof schema.partial === "function"
        ? schema.partial()
        : schema;

    // Unknown-keys behavior
    if (typeof effective.strict === "function") {
      if (unknown === "strict" && typeof effective.strict === "function")
        effective = effective.strict();
      if (
        unknown === "passthrough" &&
        typeof effective.passthrough === "function"
      )
        effective = effective.passthrough();
      if (unknown === "strip" && typeof effective.strip === "function")
        effective = effective.strip();
    }

    const parsed = effective.safeParse(context.data);
    if (!parsed.success) {
      throw new BadRequest("Validation failed", {
        issues: normalizeIssues(parsed.error),
      });
    }
    context.data = parsed.data;
    return context;
  };
}

module.exports = { validateCreate, validatePatch };
