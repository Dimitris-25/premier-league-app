// src/docs/schemas/bets.schemas.js
// OpenAPI schemas for Bets (docs folder)

const BetBase = {
  type: "object",
  properties: {
    bet_id: { type: "integer", readOnly: true },

    // Business keys
    api_bet_id: {
      type: "integer",
      description: "Bet market ID from API-Football",
    },

    // Name
    name: { type: "string", maxLength: 100 },
  },
};

const Bet = {
  allOf: [{ $ref: "#/docs/schemas/BetBase" }],
};

const BetCreate = {
  allOf: [
    { $ref: "#/docs/schemas/BetBase" },
    {
      type: "object",
      required: ["api_bet_id", "name"],
    },
  ],
};

const BetPatch = {
  type: "object",
  properties: BetBase.properties,
};

const BetsList = {
  type: "array",
  items: { $ref: "#/docs/schemas/Bet" },
};

module.exports = {
  BetBase,
  Bet,
  BetCreate,
  BetPatch,
  BetsList,
};
