// src/docs/schemas/teamsInfo.schema.js
// OpenAPI component schemas for TeamsInfo

const TeamInfoBase = {
  type: "object",
  properties: {
    team_id: { type: "integer", readOnly: true },
    api_team_id: { type: ["integer", "null"] },
    name: { type: "string" },
    code: { type: ["string", "null"] },
    founded: { type: ["integer", "null"] },
    logo: { type: ["string", "null"], format: "uri" },
    venue_id: { type: ["integer", "null"] },
    country_id: { type: ["integer", "null"] },
  },
};

const TeamInfo = {
  allOf: [{ $ref: "#/docs/schemas/TeamInfoBase" }],
};

const TeamInfoCreate = {
  allOf: [
    { $ref: "#/docs/schemas/TeamInfoBase" },
    { type: "object", required: ["api_team_id", "name"] },
  ],
};

const TeamInfoPatch = {
  type: "object",
  properties: TeamInfoBase.properties,
};

const TeamInfoList = {
  type: "array",
  items: { $ref: "#/docs/schemas/TeamInfo" },
};

module.exports = {
  TeamInfoBase,
  TeamInfo,
  TeamInfoCreate,
  TeamInfoPatch,
  TeamInfoList,
};
