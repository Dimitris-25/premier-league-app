// src/docs/schemas/leagues.schemas.js
// OpenAPI schemas for Leagues (docs folder)

const LeagueBase = {
  type: "object",
  properties: {
    league_id: { type: "integer", readOnly: true },

    // Business keys
    api_league_id: {
      type: "integer",
      description: "League ID from API-Football",
    },

    // Core
    name: { type: "string", maxLength: 100 },
    type: { type: ["string", "null"], maxLength: 50 },

    // Media
    logo: { type: ["string", "null"], format: "uri", maxLength: 255 },

    // FKs
    country_id: { type: ["integer", "null"], description: "FK to countries" },
    season_id: { type: ["integer", "null"], description: "FK to seasons" },
  },
};

const League = {
  allOf: [{ $ref: "#/docs/schemas/LeagueBase" }],
};

const LeagueCreate = {
  allOf: [
    { $ref: "#/docs/schemas/LeagueBase" },
    {
      type: "object",
      required: ["api_league_id", "name"],
    },
  ],
};

const LeaguePatch = {
  type: "object",
  properties: LeagueBase.properties,
};

const LeaguesList = {
  type: "array",
  items: { $ref: "#/docs/schemas/League" },
};

module.exports = {
  LeagueBase,
  League,
  LeagueCreate,
  LeaguePatch,
  LeaguesList,
};
