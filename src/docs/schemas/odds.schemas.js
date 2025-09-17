// src/docs/schemas/odds.schema.js
// OpenAPI schemas for Odds (docs folder)

const OddsBase = {
  type: "object",
  properties: {
    odd_id: { type: "integer", readOnly: true },

    // Composite key parts
    fixture_id: { type: "integer" },
    league_id: { type: "integer" },
    bookmaker_id: { type: "integer" },
    bet_id: { type: "integer" },
    value: { type: "string", maxLength: 50 },

    // Descriptive fields
    bookmaker_name: { type: ["string", "null"] },
    bet_name: { type: ["string", "null"] },

    // Odds & metadata
    odd: { type: ["number", "null"], format: "float" },
    update_date: { type: ["string", "null"], format: "date-time" },
  },
};

const Odds = {
  allOf: [{ $ref: "#/docs/schemas/OddsBase" }],
};

const OddsCreate = {
  allOf: [
    { $ref: "#/docs/schemas/OddsBase" },
    {
      type: "object",
      required: [
        "fixture_id",
        "league_id",
        "bookmaker_id",
        "bet_id",
        "value",
        "odd",
      ],
    },
  ],
};

const OddsPatch = {
  type: "object",
  properties: OddsBase.properties,
};

const OddsList = {
  type: "array",
  items: { $ref: "#/docs/schemas/Odds" },
};

module.exports = {
  OddsBase,
  Odds,
  OddsCreate,
  OddsPatch,
  OddsList,
};
