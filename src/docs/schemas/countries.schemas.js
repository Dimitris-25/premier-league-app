// src/docs/schemas/countries.schemas.js
// OpenAPI schemas for Countries (docs folder)

const CountryBase = {
  type: "object",
  properties: {
    country_id: { type: "integer", readOnly: true },

    // Business keys
    code: {
      type: "string",
      maxLength: 10,
      description: "ISO-like country code",
    },
    name: { type: "string", maxLength: 100 },

    // Media
    flag: { type: ["string", "null"], format: "uri", maxLength: 255 },
  },
};

const Country = {
  allOf: [{ $ref: "#/docs/schemas/CountryBase" }],
};

const CountryCreate = {
  allOf: [
    { $ref: "#/docs/schemas/CountryBase" },
    {
      type: "object",
      required: ["code", "name"],
    },
  ],
};

const CountryPatch = {
  type: "object",
  properties: CountryBase.properties,
};

const CountriesList = {
  type: "array",
  items: { $ref: "#/docs/schemas/Country" },
};

module.exports = {
  CountryBase,
  Country,
  CountryCreate,
  CountryPatch,
  CountriesList,
};
