// src/docs/paths/odds.path.js
// Curated Odds paths — read-only by default (docs folder refs)

module.exports = (exposeWrites = false) => {
  const BASE = "/api/v1/odds";

  const paths = {
    [BASE]: {
      get: {
        tags: ["odds"],
        summary: "List all odds",
        operationId: "odds_find",
        parameters: [
          {
            name: "$limit",
            in: "query",
            required: false,
            schema: { type: "integer", minimum: 1, maximum: 200 },
            description: "Max rows to return (default 50, max 200)",
          },
          {
            name: "fixture_id",
            in: "query",
            required: false,
            schema: { type: "integer" },
            description: "Filter by fixture_id",
          },
          {
            name: "league_id",
            in: "query",
            required: false,
            schema: { type: "integer" },
            description: "Filter by league_id",
          },
          {
            name: "bookmaker_id",
            in: "query",
            required: false,
            schema: { type: "integer" },
            description: "Filter by bookmaker_id",
          },
          {
            name: "bet_id",
            in: "query",
            required: false,
            schema: { type: "integer" },
            description: "Filter by bet_id",
          },
          {
            name: "value",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Filter by exact value",
          },
          {
            name: "value_like",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Filter by partial match on value (LIKE)",
          },
        ],
        responses: {
          200: {
            description: "Array of odds",
            content: {
              "application/json": {
                schema: { $ref: "#/docs/schemas/OddsList" },
              },
            },
          },
        },
      },
    },

    [`${BASE}/{odd_id}`]: {
      get: {
        tags: ["odds"],
        summary: "Get odds record by ID",
        operationId: "odds_get",
        parameters: [
          {
            name: "odd_id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Single odds record",
            content: {
              "application/json": {
                schema: { $ref: "#/docs/schemas/Odds" },
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
      tags: ["odds"],
      summary: "Create odds record",
      operationId: "odds_create",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/docs/schemas/OddsCreate" },
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

    paths[`${BASE}/{odd_id}`].patch = {
      tags: ["odds"],
      summary: "Update odds record by ID",
      operationId: "odds_patch",
      parameters: [
        {
          name: "odd_id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/docs/schemas/OddsPatch" },
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

    paths[`${BASE}/{odd_id}`].delete = {
      tags: ["odds"],
      summary: "Delete odds record by ID",
      operationId: "odds_remove",
      parameters: [
        {
          name: "odd_id",
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
