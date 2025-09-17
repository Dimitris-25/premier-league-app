// src/docs/schemas/playersProfiles.schema.js
// OpenAPI schemas for PlayersProfiles (docs folder)

const PlayersProfilesBase = {
  type: "object",
  properties: {
    player_id: { type: "integer", readOnly: true },
    api_player_id: { type: "integer" },

    // FKs / API refs
    team_id: { type: ["integer", "null"] },
    api_team_id: { type: ["integer", "null"] },

    // Identity
    name: { type: "string" },
    firstname: { type: ["string", "null"] },
    lastname: { type: ["string", "null"] },

    // Bio
    age: { type: ["integer", "null"] },
    birth_date: { type: ["string", "null"], format: "date" },
    birth_place: { type: ["string", "null"] },
    birth_country: { type: ["string", "null"] },
    nationality: { type: ["string", "null"] },

    // Physical (API returns strings like "180 cm", "75 kg")
    height: { type: ["string", "null"] },
    weight: { type: ["string", "null"] },

    // Team context
    number: { type: ["integer", "null"] }, // shirt number
    position: { type: ["string", "null"] },

    // Media
    photo: { type: ["string", "null"], format: "uri" },
  },
};

const PlayersProfiles = {
  allOf: [{ $ref: "#/docs/schemas/PlayersProfilesBase" }],
};

const PlayersProfilesCreate = {
  allOf: [
    { $ref: "#/docs/schemas/PlayersProfilesBase" },
    { type: "object", required: ["api_player_id", "name"] },
  ],
};

const PlayersProfilesPatch = {
  type: "object",
  properties: PlayersProfilesBase.properties,
};

const PlayersProfilesList = {
  type: "array",
  items: { $ref: "#/docs/schemas/PlayersProfiles" },
};

module.exports = {
  PlayersProfilesBase,
  PlayersProfiles,
  PlayersProfilesCreate,
  PlayersProfilesPatch,
  PlayersProfilesList,
};
