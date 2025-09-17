// src/docs/paths/leagues.path.js
// Curated Leagues paths — read-only by default (same pattern as bets)

module.exports = (exposeWrites = false) => {
  const BASE = "/api/v1/leagues";

  const paths = {
    [BASE]: {
      get: {
        tags: ["leagues"],
        summary: "List all leagues",
        operationId: "leagues_find",
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
            description: "Filter by league name (partial match)",
          },
          {
            name: "country_id",
            in: "query",
            required: false,
            schema: { type: "integer" },
            description: "Filter by country_id",
          },
          {
            name: "season_id",
            in: "query",
            required: false,
            schema: { type: "integer" },
            description: "Filter by season_id",
          },
          {
            name: "type",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Filter by league type (e.g. League, Cup)",
          },
        ],
        responses: {
          200: {
            description: "Array of leagues",
            content: {
              "application/json": {
                schema: { $ref: "#/docs/schemas/LeaguesList" },
              },
            },
          },
        },
      },
    },

    [`${BASE}/{league_id}`]: {
      get: {
        tags: ["leagues"],
        summary: "Get league by ID",
        operationId: "leagues_get",
        parameters: [
          {
            name: "league_id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Single league record",
            content: {
              "application/json": {
                schema: { $ref: "#/docs/schemas/League" },
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
      tags: ["leagues"],
      summary: "Create league record",
      operationId: "leagues_create",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/docs/schemas/LeagueCreate" },
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

    paths[`${BASE}/{league_id}`].patch = {
      tags: ["leagues"],
      summary: "Update league by ID",
      operationId: "leagues_patch",
      parameters: [
        {
          name: "league_id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/docs/schemas/LeaguePatch" },
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

    paths[`${BASE}/{league_id}`].delete = {
      tags: ["leagues"],
      summary: "Delete league by ID",
      operationId: "leagues_remove",
      parameters: [
        {
          name: "league_id",
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
