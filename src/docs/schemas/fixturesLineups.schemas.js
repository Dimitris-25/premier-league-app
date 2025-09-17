// OpenAPI schemas for FixturesLineUps (parent)

const FixturesLineupsBase = {
  type: "object",
  properties: {
    lineup_id: { type: "integer", readOnly: true },

    // Composite key
    fixture_id: { type: "integer" },
    team_id: { type: "integer" },

    // Coach info
    coach_id: { type: ["integer", "null"] },
    coach_name: { type: ["string", "null"] },
    coach_photo: { type: ["string", "null"], format: "uri" },

    // Formation
    formation: { type: ["string", "null"] },

    // Team colors (players)
    color_player_primary: { type: ["string", "null"] },
    color_player_number: { type: ["string", "null"] },
    color_player_border: { type: ["string", "null"] },

    // Team colors (goalkeeper)
    color_gk_primary: { type: ["string", "null"] },
    color_gk_number: { type: ["string", "null"] },
    color_gk_border: { type: ["string", "null"] },

    // Optional API ref (το κρατάς αν το έχεις στον πίνακα)
    api_fixture_id: { type: ["integer", "null"] },
  },
};

const FixturesLineups = {
  allOf: [{ $ref: "#/docs/schemas/FixturesLineupsBase" }],
};

const FixturesLineupsCreate = {
  allOf: [
    { $ref: "#/docs/schemas/FixturesLineupsBase" },
    {
      type: "object",
      required: ["fixture_id", "team_id"],
    },
  ],
};

const FixturesLineupsPatch = {
  type: "object",
  properties: FixturesLineupsBase.properties,
};

const FixturesLineupsList = {
  type: "array",
  items: { $ref: "#/docs/schemas/FixturesLineups" },
};

module.exports = {
  FixturesLineupsBase,
  FixturesLineups,
  FixturesLineupsCreate,
  FixturesLineupsPatch,
  FixturesLineupsList,
};
