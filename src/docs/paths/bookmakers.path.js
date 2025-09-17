// src/docs/paths/bookmakers.path.js
// Curated Bookmakers paths — read-only by default (docs folder refs)

module.exports = (exposeWrites = false) => {
  const BASE = "/api/v1/bookmakers";

  const paths = {
    [BASE]: {
      get: {
        tags: ["bookmakers"],
        summary: "List all bookmakers",
        operationId: "bookmakers_find",
        parameters: [
          {
            name: "$limit",
            in: "query",
            required: false,
            schema: { type: "integer", minimum: 1, maximum: 200 },
            description: "Max rows to return (default 50, max 200)",
          },
          {
            name: "name",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Filter by bookmaker name (partial match)",
          },
        ],
        responses: {
          200: {
            description: "Array of bookmakers",
            content: {
              "application/json": {
                schema: { $ref: "#/docs/schemas/BookmakersList" },
              },
            },
          },
        },
      },
    },

    [`${BASE}/{bookmaker_id}`]: {
      get: {
        tags: ["bookmakers"],
        summary: "Get bookmaker by ID",
        operationId: "bookmakers_get",
        parameters: [
          {
            name: "bookmaker_id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Single bookmaker record",
            content: {
              "application/json": {
                schema: { $ref: "#/docs/schemas/Bookmaker" },
              },
            },
          },
          404: { description: "Not found" },
        },
      },
    },
  };

  if (exposeWrites) {
    paths[BASE].post = {
      tags: ["bookmakers"],
      summary: "Create bookmaker record",
      operationId: "bookmakers_create",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/docs/schemas/BookmakerCreate" },
          },
        },
      },
      responses: {
        201: { description: "Created" },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
        409: { description: "Conflict" },
      },
    };

    paths[`${BASE}/{bookmaker_id}`].patch = {
      tags: ["bookmakers"],
      summary: "Update bookmaker by ID",
      operationId: "bookmakers_patch",
      parameters: [
        {
          name: "bookmaker_id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/docs/schemas/BookmakerPatch" },
          },
        },
      },
      responses: {
        200: { description: "Updated" },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
        404: { description: "Not found" },
      },
    };

    paths[`${BASE}/{bookmaker_id}`].delete = {
      tags: ["bookmakers"],
      summary: "Delete bookmaker by ID",
      operationId: "bookmakers_remove",
      parameters: [
        {
          name: "bookmaker_id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      responses: {
        200: { description: "Deleted" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
        404: { description: "Not found" },
      },
    };
  }

  return paths;
};
