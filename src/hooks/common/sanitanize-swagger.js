// src/hooks/common/sanitize-swagger.js

function toDocsRefs(doc) {
  doc.docs = doc.docs || {};
  doc.docs.schemas = doc.docs.schemas || {};
  doc.components = doc.components || {};
  doc.components.schemas = doc.components.schemas || {};

  // 1) Copy ΟΛΑ τα components.schemas -> docs.schemas (bridge)
  for (const [name, schema] of Object.entries(doc.components.schemas)) {
    if (!doc.docs.schemas[name]) {
      doc.docs.schemas[name] = schema;
    }
  }

  // 2) Fallback AnyObject
  if (!doc.docs.schemas.AnyObject) {
    doc.docs.schemas.AnyObject = { type: "object", additionalProperties: true };
  }

  const ensureSchema = (name) => {
    if (doc.docs.schemas[name]) return;
    if (name.endsWith("List")) {
      const base = name.slice(0, -4);
      if (!doc.docs.schemas[base])
        doc.docs.schemas[base] = { $ref: "/docs/schemas/AnyObject" };
      doc.docs.schemas[name] = {
        type: "array",
        items: { $ref: `/docs/schemas/${base}` },
      };
    } else {
      doc.docs.schemas[name] = { $ref: "/docs/schemas/AnyObject" };
    }
  };

  const normalizeRef = (ref) => {
    if (ref.startsWith("#/components/schemas/")) {
      const name = ref.split("/").pop();
      ensureSchema(name);
      return `/docs/schemas/${name}`;
    }
    return ref; // αφήνουμε τα ήδη "/docs/schemas/..."
  };

  const walk = (schema) => {
    if (!schema) return;
    if (typeof schema.$ref === "string") {
      schema.$ref = normalizeRef(schema.$ref);
      return;
    }
    if (schema.items) walk(schema.items);
    if (Array.isArray(schema.oneOf)) schema.oneOf.forEach(walk);
    if (Array.isArray(schema.anyOf)) schema.anyOf.forEach(walk);
    if (Array.isArray(schema.allOf)) schema.allOf.forEach(walk);
    if (schema.properties) Object.values(schema.properties).forEach(walk);
    if (
      schema.additionalProperties &&
      typeof schema.additionalProperties === "object"
    )
      walk(schema.additionalProperties);
  };

  for (const pathObj of Object.values(doc.paths || {})) {
    for (const op of Object.values(pathObj || {})) {
      if (!op || typeof op !== "object") continue;

      const responses = op.responses;
      if (responses) {
        for (const r of Object.values(responses)) {
          const content = r && r.content;
          if (!content) continue;
          for (const mt of Object.values(content)) {
            const schema = mt && mt.schema;
            if (schema) walk(schema);
          }
        }
      }

      const rb = op.requestBody && op.requestBody.content;
      if (rb) {
        for (const mt of Object.values(rb)) {
          const schema = mt && mt.schema;
          if (schema) walk(schema);
        }
      }

      if (Array.isArray(op.parameters)) {
        for (const p of op.parameters) {
          if (p?.schema) walk(p.schema);
          if (p?.content) {
            for (const mt of Object.values(p.content)) {
              const schema = mt && mt.schema;
              if (schema) walk(schema);
            }
          }
        }
      }
    }
  }

  return doc;
}

function safeSanitizeOpenApi(doc) {
  try {
    const clone =
      typeof globalThis.structuredClone === "function"
        ? globalThis.structuredClone(doc)
        : JSON.parse(JSON.stringify(doc));
    return toDocsRefs(clone);
  } catch (err) {
    console.warn("[swagger-sanitize] skipped:", err);
    return doc;
  }
}

module.exports = { safeSanitizeOpenApi };
