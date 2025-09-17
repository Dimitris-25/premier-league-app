// src/docs/paths/playersSeasonsStats.path.js
// Curated PlayersSeasonsStats paths — read-only by default (docs folder refs)

module.exports = (exposeWrites = false) => {
  const BASE = "/api/v1/players-season-stats";

  const paths = {
    [BASE]: {
      get: {
        tags: ["playersSeasonsStats"],
        summary: "List all players season stats",
        operationId: "playersSeasonsStats_find",
        responses: {
          200: {
            description: "Array of players season stats",
            content: {
              "application/json": {
                schema: { $ref: "#/docs/schemas/PlayersSeasonStatsList" },
              },
            },
          },
        },
      },
    },

    [`${BASE}/{pss_id}`]: {
      get: {
        tags: ["playersSeasonsStats"],
        summary: "Get players season stats by ID",
        operationId: "playersSeasonsStats_get",
        parameters: [
          {
            name: "pss_id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Single player season stats record",
            content: {
              "application/json": {
                schema: { $ref: "#/docs/schemas/PlayersSeasonStats" },
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
      tags: ["playersSeasonsStats"],
      summary: "Create players season stats record",
      operationId: "playersSeasonsStats_create",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/docs/schemas/PlayersSeasonStatsCreate" },
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

    paths[`${BASE}/{pss_id}`].patch = {
      tags: ["playersSeasonsStats"],
      summary: "Update players season stats by ID",
      operationId: "playersSeasonsStats_patch",
      parameters: [
        {
          name: "pss_id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/docs/schemas/PlayersSeasonStatsPatch" },
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

    paths[`${BASE}/{pss_id}`].delete = {
      tags: ["playersSeasonsStats"],
      summary: "Delete players season stats by ID",
      operationId: "playersSeasonsStats_remove",
      parameters: [
        {
          name: "pss_id",
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
