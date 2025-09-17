// src/docs/paths/fixturesLineups.path.js
module.exports = (exposeWrites = false) => {
  const BASE = "/api/v1/fixtures-lineups"; // <-- ΟΧΙ /fixturesLineups

  const paths = {
    [BASE]: {
      get: {
        tags: ["fixturesLineups"],
        summary: "List all fixtures lineups",
        operationId: "fixturesLineups_find",
        responses: {
          200: {
            description: "Array of fixtures lineups",
            content: {
              "application/json": {
                schema: { $ref: "#/docs/schemas/FixturesLineupsList" },
              },
            },
          },
        },
      },
    },

    [`${BASE}/{lineup_id}`]: {
      get: {
        tags: ["fixturesLineups"],
        summary: "Get lineup by ID",
        operationId: "fixturesLineups_get",
        parameters: [
          {
            name: "lineup_id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Single lineup record",
            content: {
              "application/json": {
                schema: { $ref: "#/docs/schemas/FixturesLineups" },
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
      tags: ["fixturesLineups"],
      summary: "Create lineup record",
      operationId: "fixturesLineups_create",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/docs/schemas/FixturesLineupsCreate" },
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

    paths[`${BASE}/{lineup_id}`].patch = {
      tags: ["fixturesLineups"],
      summary: "Update lineup record by ID",
      operationId: "fixturesLineups_patch",
      parameters: [
        {
          name: "lineup_id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/docs/schemas/FixturesLineupsPatch" },
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

    paths[`${BASE}/{lineup_id}`].delete = {
      tags: ["fixturesLineups"],
      summary: "Delete lineup record by ID",
      operationId: "fixturesLineups_remove",
      parameters: [
        {
          name: "lineup_id",
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
