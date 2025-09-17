// src/docs/paths/playersTopStats.path.js
// Curated PlayersTopStats paths — read-only by default (docs folder refs)

module.exports = (exposeWrites = false) => {
  const BASE = "/api/v1/players-top-stats";

  const paths = {
    [BASE]: {
      get: {
        tags: ["playersTopStats"],
        summary: "List all players top stats (from files)",
        operationId: "playersTopStats_find",
        responses: {
          200: {
            description: "Array of players top stats",
            content: {
              "application/json": {
                schema: { $ref: "#/docs/schemas/PlayersTopStatsList" },
              },
            },
          },
        },
      },
    },

    [`${BASE}/{topstat_id}`]: {
      get: {
        tags: ["playersTopStats"],
        summary: "Get player top stats by ID",
        operationId: "playersTopStats_get",
        parameters: [
          {
            name: "topstat_id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Single player top stats record",
            content: {
              "application/json": {
                schema: { $ref: "#/docs/schemas/PlayersTopStats" },
              },
            },
          },
          404: { description: "Not found" },
        },
      },
    },
  };

  if (exposeWrites) {
    // Create
    paths[BASE].post = {
      tags: ["playersTopStats"],
      summary: "Create players top stats record",
      operationId: "playersTopStats_create",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/docs/schemas/PlayersTopStatsCreate" },
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

    // Patch
    paths[`${BASE}/{topstat_id}`].patch = {
      tags: ["playersTopStats"],
      summary: "Update player top stats by ID",
      operationId: "playersTopStats_patch",
      parameters: [
        {
          name: "topstat_id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/docs/schemas/PlayersTopStatsPatch" },
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

    // Delete
    paths[`${BASE}/{topstat_id}`].delete = {
      tags: ["playersTopStats"],
      summary: "Delete player top stats by ID",
      operationId: "playersTopStats_remove",
      parameters: [
        {
          name: "topstat_id",
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
