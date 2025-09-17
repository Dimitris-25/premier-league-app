// src/docs/paths/countries.path.js
// Curated Countries paths — read-only by default (docs folder refs)

module.exports = (exposeWrites = false) => {
  const BASE = "/api/v1/countries";

  const paths = {
    [BASE]: {
      get: {
        tags: ["countries"],
        summary: "List all countries",
        operationId: "countries_find",
        parameters: [
          {
            name: "$limit",
            in: "query",
            required: false,
            schema: { type: "integer", minimum: 1, maximum: 200 },
            description: "Max rows to return (default 50, max 200)",
          },
          {
            name: "code",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Filter by ISO-like country code",
          },
          {
            name: "name",
            in: "query",
            required: false,
            schema: { type: "string" },
            description: "Filter by country name (partial match)",
          },
        ],
        responses: {
          200: {
            description: "Array of countries",
            content: {
              "application/json": {
                schema: { $ref: "#/docs/schemas/CountriesList" },
              },
            },
          },
        },
      },
    },

    [`${BASE}/{country_id}`]: {
      get: {
        tags: ["countries"],
        summary: "Get country by ID",
        operationId: "countries_get",
        parameters: [
          {
            name: "country_id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Single country record",
            content: {
              "application/json": {
                schema: { $ref: "#/docs/schemas/Country" },
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
      tags: ["countries"],
      summary: "Create country record",
      operationId: "countries_create",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/docs/schemas/CountryCreate" },
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

    paths[`${BASE}/{country_id}`].patch = {
      tags: ["countries"],
      summary: "Update country by ID",
      operationId: "countries_patch",
      parameters: [
        {
          name: "country_id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/docs/schemas/CountryPatch" },
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

    paths[`${BASE}/{country_id}`].delete = {
      tags: ["countries"],
      summary: "Delete country by ID",
      operationId: "countries_remove",
      parameters: [
        {
          name: "country_id",
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
