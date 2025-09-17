// src/docs/paths/venues.path.js
// Curated Venues paths with optional write exposure via env flag

module.exports = (exposeWrites = false) => {
  const paths = {
    "/api/v1/venues": {
      get: {
        tags: ["venues"],
        summary: "List all venues",
        operationId: "venues_find",
        responses: {
          200: {
            description: "Array of venues",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Venue" },
                },
              },
            },
          },
        },
      },
    },

    "/api/v1/venues/{venue_id}": {
      get: {
        tags: ["venues"],
        summary: "Get venue by ID",
        operationId: "venues_get",
        parameters: [
          {
            name: "venue_id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Single venue",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Venue" },
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
    paths["/api/v1/venues"].post = {
      tags: ["venues"],
      summary: "Create venue",
      operationId: "venues_create",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            // Prefer a dedicated input schema if available
            schema: { $ref: "#/components/schemas/VenueCreate" },
          },
        },
      },
      responses: {
        201: {
          description: "Venue created",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Venue" },
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
    paths["/api/v1/venues/{venue_id}"].patch = {
      tags: ["venues"],
      summary: "Update venue",
      operationId: "venues_patch",
      parameters: [
        {
          name: "venue_id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            // Prefer a dedicated patch schema if available
            schema: { $ref: "#/components/schemas/VenuePatch" },
          },
        },
      },
      responses: {
        200: {
          description: "Venue updated",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Venue" },
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
    paths["/api/v1/venues/{venue_id}"].delete = {
      tags: ["venues"],
      summary: "Delete venue",
      operationId: "venues_remove",
      parameters: [
        {
          name: "venue_id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      responses: {
        200: { description: "Venue deleted" },
        401: { description: "Unauthorized" },
        403: { description: "Forbidden" },
        404: { description: "Not found" },
      },
    };
  }

  return paths;
};
