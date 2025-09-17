// src/docs/paths/coaches.path.js
// Curated Coaches paths — read-only by default (docs folder refs)

module.exports = (exposeWrites = false) => {
  const BASE = "/api/v1/coaches";

  const paths = {
    [BASE]: {
      get: {
        tags: ["coaches"],
        summary: "List all coaches",
        operationId: "coaches_find",
        parameters: [
          {
            name: "$limit",
            in: "query",
            required: false,
            schema: { type: "integer", minimum: 1, maximum: 200 },
            description: "Max rows to return (default 50, max 200)",
          },
          {
            name: "team_id",
            in: "query",
            required: false,
            schema: { type: "integer" },
            description: "Filter by team_id",
          },
          {
            name: "api_team_id",
            in: "query",
            required: false,
            schema: { type: "integer" },
            description: "Filter by API-Football team_id",
          },
          {
            name: "nationality",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Filter by nationality",
          },
        ],
        responses: {
          200: {
            description: "Array of coaches",
            content: {
              "application/json": {
                schema: { $ref: "#/docs/schemas/CoachesList" },
              },
            },
          },
        },
      },
    },

    [`${BASE}/{coach_id}`]: {
      get: {
        tags: ["coaches"],
        summary: "Get coach by ID",
        operationId: "coaches_get",
        parameters: [
          {
            name: "coach_id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Single coach record",
            content: {
              "application/json": {
                schema: { $ref: "#/docs/schemas/Coach" },
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
      tags: ["coaches"],
      summary: "Create coach record",
      operationId: "coaches_create",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/docs/schemas/CoachCreate" },
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

    paths[`${BASE}/{coach_id}`].patch = {
      tags: ["coaches"],
      summary: "Update coach by ID",
      operationId: "coaches_patch",
      parameters: [
        {
          name: "coach_id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/docs/schemas/CoachPatch" },
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

    paths[`${BASE}/{coach_id}`].delete = {
      tags: ["coaches"],
      summary: "Delete coach by ID",
      operationId: "coaches_remove",
      parameters: [
        {
          name: "coach_id",
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
