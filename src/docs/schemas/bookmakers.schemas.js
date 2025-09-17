// src/docs/schemas/bookmakers.schemas.js
// OpenAPI schemas for Bookmakers (docs folder)

const BookmakerBase = {
  type: "object",
  properties: {
    bookmaker_id: { type: "integer", readOnly: true },

    // Business keys
    api_bookmaker_id: {
      type: "integer",
      description: "Bookmaker ID from API-Football",
    },

    // Name
    name: { type: "string", maxLength: 100 },
  },
};

const Bookmaker = {
  allOf: [{ $ref: "#/docs/schemas/BookmakerBase" }],
};

const BookmakerCreate = {
  allOf: [
    { $ref: "#/docs/schemas/BookmakerBase" },
    {
      type: "object",
      required: ["api_bookmaker_id", "name"],
    },
  ],
};

const BookmakerPatch = {
  type: "object",
  properties: BookmakerBase.properties,
};

const BookmakersList = {
  type: "array",
  items: { $ref: "#/docs/schemas/Bookmaker" },
};

module.exports = {
  BookmakerBase,
  Bookmaker,
  BookmakerCreate,
  BookmakerPatch,
  BookmakersList,
};
