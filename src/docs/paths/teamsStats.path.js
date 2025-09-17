// Curated Team Stats (files) paths — read-only by default
module.exports = (exposeWrites = false) => {
  const BASE = "/api/v1/teams-stats-files";

  const paths = {
    [BASE]: {
      get: {
        tags: ["teamsStats"],
        summary: "List all team stats (from files)",
        operationId: "teamsStats_find",
        responses: {
          200: {
            description: "Array of team stats",
            content: {
              "application/json": {
                schema: { $ref: "#/docs/schemas/TeamStatsList" },
              },
            },
          },
        },
      },
    },
    [`${BASE}/{stats_id}`]: {
      get: {
        tags: ["teamsStats"],
        summary: "Get team stats by ID",
        operationId: "teamsStats_get",
        parameters: [
          {
            name: "stats_id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Single team stats record",
            content: {
              "application/json": {
                schema: { $ref: "#/docs/schemas/TeamStats" },
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
      tags: ["teamsStats"],
      summary: "Create team stats record",
      operationId: "teamsStats_create",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/docs/schemas/TeamStatsCreate" },
          },
        },
      },
      responses: { 201: { description: "Created" } },
    };

    paths[`${BASE}/{stats_id}`].patch = {
      tags: ["teamsStats"],
      summary: "Update team stats by ID",
      operationId: "teamsStats_patch",
      parameters: [
        {
          name: "stats_id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/docs/schemas/TeamStatsPatch" },
          },
        },
      },
      responses: {
        200: { description: "Updated" },
        404: { description: "Not found" },
      },
    };

    paths[`${BASE}/{stats_id}`].delete = {
      tags: ["teamsStats"],
      summary: "Delete team stats by ID",
      operationId: "teamsStats_remove",
      parameters: [
        {
          name: "stats_id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      responses: {
        200: { description: "Deleted" },
        404: { description: "Not found" },
      },
    };
  }

  return paths;
};
