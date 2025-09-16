// src/docs/paths/users.path.js
// OpenAPI paths for the "users" section (full CRUD)

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
      summary: "List all users",
      operationId: "users_find",
      responses: {
        200: {
          description: "Array of users",
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
      summary: "Create a new user",
      operationId: "users_create",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UserCreate" },
          },
        },
      },
      responses: {
        201: {
          description: "User created",
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
      summary: "Patch multiple users",
      operationId: "users_patch_many",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UserPatch" },
          },
        },
      },
      responses: { 200: { description: "Users patched" } },
    },
    delete: {
      tags: ["users"],
      summary: "Delete multiple users",
      operationId: "users_remove_many",
      responses: { 200: { description: "Users deleted" } },
    },
  },

  "/api/v1/users/{user_id}": {
    get: {
      tags: ["users"],
      summary: "Get user by ID",
      operationId: "users_get",
      parameters: [userIdParam],
      responses: {
        200: {
          description: "User object",
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
      summary: "Patch user by ID",
      operationId: "users_patch",
      parameters: [userIdParam],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UserPatch" },
          },
        },
      },
      responses: { 200: { description: "User patched" } },
    },
    delete: {
      tags: ["users"],
      summary: "Delete user by ID",
      operationId: "users_remove",
      parameters: [userIdParam],
      responses: { 200: { description: "User deleted" } },
    },
  },
};
