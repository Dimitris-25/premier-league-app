// src/docs/paths/users.path.js
// Clean versioned OpenAPI paths for the "users" section.

const userIdParam = {
  name: "user_id",
  in: "path",
  required: true,
  schema: { type: "integer" },
};

module.exports = {
  "/api/v1/users": {
    get: {
      tags: ["users"],
      summary: "List users",
      responses: {
        200: {
          description: "OK",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: { $ref: "#/components/schemas/User" },
              },
            },
          },
        },
      },
    },

    post: {
      tags: ["users"],
      summary: "Create user",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UserCreate" },
          },
        },
      },
      responses: {
        200: {
          description: "Created",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/User" },
            },
          },
        },
      },
    },

    patch: {
      tags: ["users"],
      summary: "Patch many users",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UserPatch" },
          },
        },
      },
      responses: { 200: { description: "OK" } },
    },

    delete: {
      tags: ["users"],
      summary: "Delete many users",
      responses: { 200: { description: "OK" } },
    },
  },

  "/api/v1/users/{user_id}": {
    get: {
      tags: ["users"],
      summary: "Get user by id",
      parameters: [userIdParam],
      responses: {
        200: {
          description: "OK",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/User" },
            },
          },
        },
      },
    },

    patch: {
      tags: ["users"],
      summary: "Patch user by id",
      parameters: [userIdParam],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UserPatch" },
          },
        },
      },
      responses: { 200: { description: "OK" } },
    },

    delete: {
      tags: ["users"],
      summary: "Delete user by id",
      parameters: [userIdParam],
      responses: { 200: { description: "OK" } },
    },
  },
};
