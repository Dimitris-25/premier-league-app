// src/docs/schemas/seasons.schema.js
// OpenAPI component schemas for Seasons

const SeasonBase = {
  type: "object",
  properties: {
    season_id: { type: "integer", readOnly: true },
    api_season_id: { type: ["integer", "null"] },
    year: { type: "integer" },
    start: { type: ["string", "null"], format: "date" },
    end: { type: ["string", "null"], format: "date" },
    current: { type: ["boolean", "null"] },
  },
};

const Season = {
  allOf: [{ $ref: "#/docs/schemas/SeasonBase" }],
};

const SeasonCreate = {
  allOf: [
    { $ref: "#/docs/schemas/SeasonBase" },
    { type: "object", required: ["year"] },
  ],
};

const SeasonPatch = {
  type: "object",
  properties: SeasonBase.properties,
};

const SeasonList = {
  type: "array",
  items: { $ref: "#/docs/schemas/Season" },
};

module.exports = {
  SeasonBase,
  Season,
  SeasonCreate,
  SeasonPatch,
  SeasonList,
};
