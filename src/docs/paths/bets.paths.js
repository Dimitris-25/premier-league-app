// src/docs/paths/bets.path.js
// Curated Bets paths — read-only by default (docs folder refs)

module.exports = (exposeWrites = false) => {
  const BASE = "/api/v1/bets";

  const paths = {
    [BASE]: {
      get: {
        tags: ["bets"],
        summary: "List all bets",
        operationId: "bets_find",
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
            description: "Filter by bet market name (partial match)",
          },
        ],
        responses: {
          200: {
            description: "Array of bets",
            content: {
              "application/json": {
                schema: { $ref: "#/docs/schemas/BetsList" },
              },
            },
          },
        },
      },
    },

    [`${BASE}/{bet_id}`]: {
      get: {
        tags: ["bets"],
        summary: "Get bet by ID",
        operationId: "bets_get",
        parameters: [
          {
            name: "bet_id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Single bet record",
            content: {
              "application/json": {
                schema: { $ref: "#/docs/schemas/Bet" },
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
      tags: ["bets"],
      summary: "Create bet record",
      operationId: "bets_create",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/docs/schemas/BetCreate" },
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

    paths[`${BASE}/{bet_id}`].patch = {
      tags: ["bets"],
      summary: "Update bet by ID",
      operationId: "bets_patch",
      parameters: [
        {
          name: "bet_id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/docs/schemas/BetPatch" },
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

    paths[`${BASE}/{bet_id}`].delete = {
      tags: ["bets"],
      summary: "Delete bet by ID",
      operationId: "bets_remove",
      parameters: [
        {
          name: "bet_id",
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
