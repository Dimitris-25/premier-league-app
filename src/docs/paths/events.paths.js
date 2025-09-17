// src/docs/paths/events.path.js
// Curated Events paths — read-only by default (docs folder refs)

module.exports = (exposeWrites = false) => {
  const BASE = "/api/v1/events";

  const paths = {
    [BASE]: {
      get: {
        tags: ["events"],
        summary: "List all events",
        operationId: "events_find",
        parameters: [
          {
            name: "$limit",
            in: "query",
            required: false,
            schema: { type: "integer", minimum: 1, maximum: 200 },
            description: "Max rows to return (default 50, max 200)",
          },
          {
            name: "fixture_id",
            in: "query",
            required: false,
            schema: { type: "integer" },
            description: "Filter by fixture_id",
          },
          {
            name: "team_id",
            in: "query",
            required: false,
            schema: { type: "integer" },
            description: "Filter by team_id",
          },
          {
            name: "type",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Filter by event type (e.g. Goal, Card, Substitution)",
          },
          {
            name: "detail",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Filter by event detail (e.g. Yellow Card, Penalty)",
          },
        ],
        responses: {
          200: {
            description: "Array of events",
            content: {
              "application/json": {
                schema: { $ref: "#/docs/schemas/EventsList" },
              },
            },
          },
        },
      },
    },

    [`${BASE}/{event_id}`]: {
      get: {
        tags: ["events"],
        summary: "Get event by ID",
        operationId: "events_get",
        parameters: [
          {
            name: "event_id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Single event record",
            content: {
              "application/json": {
                schema: { $ref: "#/docs/schemas/Event" },
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
      tags: ["events"],
      summary: "Create event record",
      operationId: "events_create",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/docs/schemas/EventCreate" },
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

    paths[`${BASE}/{event_id}`].patch = {
      tags: ["events"],
      summary: "Update event by ID",
      operationId: "events_patch",
      parameters: [
        {
          name: "event_id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/docs/schemas/EventPatch" },
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

    paths[`${BASE}/{event_id}`].delete = {
      tags: ["events"],
      summary: "Delete event by ID",
      operationId: "events_remove",
      parameters: [
        {
          name: "event_id",
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
