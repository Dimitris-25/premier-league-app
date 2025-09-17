// src/docs/paths/seasons.path.js
// Curated Seasons paths with optional write exposure via env flag

module.exports = (exposeWrites = false) => {
  const paths = {
    "/api/v1/seasons": {
      get: {
        tags: ["seasons"],
        summary: "List all seasons",
        operationId: "seasons_find",
        responses: {
          200: {
            description: "Array of seasons",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/docs/schemas/Season" },
                },
              },
            },
          },
        },
      },
    },

    "/api/v1/seasons/{season_id}": {
      get: {
        tags: ["seasons"],
        summary: "Get season by ID",
        operationId: "seasons_get",
        parameters: [
          {
            name: "season_id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Single season",
            content: {
              "application/json": {
                schema: { $ref: "#/docs/schemas/Season" },
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
    paths["/api/v1/seasons"].post = {
      tags: ["seasons"],
      summary: "Create season",
      operationId: "seasons_create",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/docs/schemas/SeasonCreate" },
          },
        },
      },
      responses: {
        201: {
          description: "Season created",
          content: {
            "application/json": {
              schema: { $ref: "#/docs/schemas/Season" },
            },
          },
        },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
        409: { description: "Conflict" },
      },
    };

    // Patch
    paths["/api/v1/seasons/{season_id}"].patch = {
      tags: ["seasons"],
      summary: "Update season",
      operationId: "seasons_patch",
      parameters: [
        {
          name: "season_id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/docs/schemas/SeasonPatch" },
          },
        },
      },
      responses: {
        200: {
          description: "Season updated",
          content: {
            "application/json": {
              schema: { $ref: "#/docs/schemas/Season" },
            },
          },
        },
        400: { description: "Validation error" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
        404: { description: "Not found" },
      },
    };

    // Delete
    paths["/api/v1/seasons/{season_id}"].delete = {
      tags: ["seasons"],
      summary: "Delete season",
      operationId: "seasons_remove",
      parameters: [
        {
          name: "season_id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      responses: {
        200: { description: "Season deleted" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
        404: { description: "Not found" },
      },
    };
  }

  return paths;
};
