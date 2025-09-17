// src/docs/schemas/coaches.schemas.js
// OpenAPI schemas for Coaches (docs folder)

const CoachBase = {
  type: "object",
  properties: {
    coach_id: { type: "integer", readOnly: true },

    // Business keys
    api_coach_id: {
      type: "integer",
      description: "Coach ID from API-Football",
    },

    // Identity
    name: { type: "string", maxLength: 100 },
    firstname: { type: ["string", "null"], maxLength: 100 },
    lastname: { type: ["string", "null"], maxLength: 100 },
    age: { type: ["integer", "null"] },

    // Birth
    birth_date: { type: ["string", "null"], format: "date" },
    birth_place: { type: ["string", "null"], maxLength: 100 },
    birth_country: { type: ["string", "null"], maxLength: 100 },

    // Meta
    nationality: { type: ["string", "null"], maxLength: 100 },
    height: { type: ["string", "null"], maxLength: 20 },
    weight: { type: ["string", "null"], maxLength: 20 },
    photo: { type: ["string", "null"], format: "uri", maxLength: 255 },

    // Team relations
    team_id: { type: ["integer", "null"], description: "FK to teamsInfo" },
    api_team_id: {
      type: ["integer", "null"],
      description: "API-Football team ID",
    },
  },
};

const Coach = {
  allOf: [{ $ref: "#/docs/schemas/CoachBase" }],
};

const CoachCreate = {
  allOf: [
    { $ref: "#/docs/schemas/CoachBase" },
    {
      type: "object",
      required: ["api_coach_id", "name"],
    },
  ],
};

const CoachPatch = {
  type: "object",
  properties: CoachBase.properties,
};

const CoachesList = {
  type: "array",
  items: { $ref: "#/docs/schemas/Coach" },
};

module.exports = {
  CoachBase,
  Coach,
  CoachCreate,
  CoachPatch,
  CoachesList,
};
