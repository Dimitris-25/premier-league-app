// src/docs/paths/cities.path.js
// Curated Cities paths — read-only by default (docs folder refs)

module.exports = (exposeWrites = false) => {
  const BASE = "/api/v1/cities";

  const paths = {
    [BASE]: {
      get: {
        tags: ["cities"],
        summary: "List all cities",
        operationId: "cities_find",
        parameters: [
          {
            name: "$limit",
            in: "query",
            required: false,
            schema: { type: "integer", minimum: 1, maximum: 200 },
            description: "Max rows to return (default 50, max 200)",
          },
          {
            name: "country_id",
            in: "query",
            required: false,
            schema: { type: "integer" },
            description: "Filter by country_id",
          },
          {
            name: "name",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Filter by city name (partial match)",
          },
        ],
        responses: {
          200: {
            description: "Array of cities",
            content: {
              "application/json": {
                schema: { $ref: "#/docs/schemas/CitiesList" },
              },
            },
          },
        },
      },
    },

    [`${BASE}/{city_id}`]: {
      get: {
        tags: ["cities"],
        summary: "Get city by ID",
        operationId: "cities_get",
        parameters: [
          {
            name: "city_id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Single city record",
            content: {
              "application/json": {
                schema: { $ref: "#/docs/schemas/City" },
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
      tags: ["cities"],
      summary: "Create city record",
      operationId: "cities_create",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/docs/schemas/CityCreate" },
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

    paths[`${BASE}/{city_id}`].patch = {
      tags: ["cities"],
      summary: "Update city by ID",
      operationId: "cities_patch",
      parameters: [
        {
          name: "city_id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/docs/schemas/CityPatch" },
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

    paths[`${BASE}/{city_id}`].delete = {
      tags: ["cities"],
      summary: "Delete city by ID",
      operationId: "cities_remove",
      parameters: [
        {
          name: "city_id",
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
