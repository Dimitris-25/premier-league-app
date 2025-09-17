// Curated TeamsInfo paths with optional exposure for writes & maintenance GETs
module.exports = (exposeWrites = false, exposeMaintenance = false) => {
  const paths = {
    "/api/v1/teamsInfo": {
      get: {
        tags: ["teamsInfo"],
        summary: "List all teams",
        operationId: "teamsInfo_find",
        responses: {
          200: {
            description: "Array of teams",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/docs/schemas/TeamInfo" },
                },
              },
            },
          },
        },
      },
    },

    "/api/v1/teamsInfo/{team_id}": {
      get: {
        tags: ["teamsInfo"],
        summary: "Get team by ID",
        operationId: "teamsInfo_get",
        parameters: [
          {
            name: "team_id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Single team",
            content: {
              "application/json": {
                schema: { $ref: "#/docs/schemas/TeamInfo" },
              },
            },
          },
          404: { description: "Not found" },
        },
      },
    },
  };

  // -- Optional: maintenance GETs (admin-only) --
  if (exposeMaintenance) {
    paths["/api/v1/teamsInfo/refresh/api"] = {
      get: {
        tags: ["teamsInfo"],
        summary: "Sync season 2025 from API-Football",
        operationId: "teamsInfo_refresh_api",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Sync result",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ok: { type: "boolean" },
                    season: { type: "integer" },
                    total: { type: "integer" },
                    created: { type: "integer" },
                    updated: { type: "integer" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    };

    paths["/api/v1/teamsInfo/refresh/file"] = {
      get: {
        tags: ["teamsInfo"],
        summary: "Bulk import teams from file (2015–2024)",
        operationId: "teamsInfo_refresh_file",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Import result",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    ok: { type: "boolean" },
                    seasons: { type: "string" },
                    created: { type: "integer" },
                    updated: { type: "integer" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    };
  }

  // -- Optional: writes, όπως ήδη κάνεις --
  if (exposeWrites) {
    paths["/api/v1/teamsInfo"].post = {
      tags: ["teamsInfo"],
      summary: "Create team",
      operationId: "teamsInfo_create",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/docs/schemas/TeamInfoCreate" },
          },
        },
      },
      responses: {
        201: {
          description: "Team created",
          content: {
            "application/json": {
              schema: { $ref: "#/docs/schemas/TeamInfo" },
            },
          },
        },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
        409: { description: "Conflict" },
      },
    };

    paths["/api/v1/teamsInfo/{team_id}"].patch = {
      tags: ["teamsInfo"],
      summary: "Update team",
      operationId: "teamsInfo_patch",
      parameters: [
        {
          name: "team_id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/docs/schemas/TeamInfoUpdate" },
          },
        },
      },
      responses: {
        200: {
          description: "Team updated",
          content: {
            "application/json": {
              schema: { $ref: "#/docs/schemas/TeamInfo" },
            },
          },
        },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
        404: { description: "Not found" },
      },
    };

    paths["/api/v1/teamsInfo/{team_id}"].delete = {
      tags: ["teamsInfo"],
      summary: "Delete team",
      operationId: "teamsInfo_remove",
      parameters: [
        {
          name: "team_id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      responses: {
        200: { description: "Team deleted" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
        404: { description: "Not found" },
      },
    };
  }

  return paths;
};
