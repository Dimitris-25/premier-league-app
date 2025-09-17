// src/docs/schemas/cities.schemas.js
// OpenAPI schemas for Cities (docs folder)

const CityBase = {
  type: "object",
  properties: {
    city_id: { type: "integer", readOnly: true },

    // Business fields
    name: { type: "string", maxLength: 100 },
    country_id: {
      type: "integer",
      description: "FK to countries",
    },
  },
};

const City = {
  allOf: [{ $ref: "#/docs/schemas/CityBase" }],
};

const CityCreate = {
  allOf: [
    { $ref: "#/docs/schemas/CityBase" },
    {
      type: "object",
      required: ["name", "country_id"],
    },
  ],
};

const CityPatch = {
  type: "object",
  properties: CityBase.properties,
};

const CitiesList = {
  type: "array",
  items: { $ref: "#/docs/schemas/City" },
};

module.exports = {
  CityBase,
  City,
  CityCreate,
  CityPatch,
  CitiesList,
};
