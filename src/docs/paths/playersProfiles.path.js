// src/docs/paths/playersProfiles.path.js
// Curated PlayersProfiles paths — read-only by default (docs folder refs)

module.exports = (exposeWrites = false) => {
  const BASE = "/api/v1/players-profiles";

  const paths = {
    [BASE]: {
      get: {
        tags: ["playersProfiles"],
        summary: "List all players profiles",
        operationId: "playersProfiles_find",
        responses: {
          200: {
            description: "Array of players profiles",
            content: {
              "application/json": {
                schema: { $ref: "#/docs/schemas/PlayersProfilesList" },
              },
            },
          },
        },
      },
    },

    [`${BASE}/{player_id}`]: {
      get: {
        tags: ["playersProfiles"],
        summary: "Get player profile by ID",
        operationId: "playersProfiles_get",
        parameters: [
          {
            name: "player_id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Single player profile",
            content: {
              "application/json": {
                schema: { $ref: "#/docs/schemas/PlayersProfiles" },
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
      tags: ["playersProfiles"],
      summary: "Create player profile",
      operationId: "playersProfiles_create",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/docs/schemas/PlayersProfilesCreate" },
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
    paths[`${BASE}/{player_id}`].patch = {
      tags: ["playersProfiles"],
      summary: "Update player profile by ID",
      operationId: "playersProfiles_patch",
      parameters: [
        {
          name: "player_id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/docs/schemas/PlayersProfilesPatch" },
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
    paths[`${BASE}/{player_id}`].delete = {
      tags: ["playersProfiles"],
      summary: "Delete player profile by ID",
      operationId: "playersProfiles_remove",
      parameters: [
        {
          name: "player_id",
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
