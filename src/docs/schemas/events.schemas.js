// src/docs/schemas/events.schemas.js
// OpenAPI schemas for Events (docs folder)

const EventBase = {
  type: "object",
  properties: {
    event_id: { type: "integer", readOnly: true },

    // FKs
    fixture_id: { type: "integer" },
    team_id: { type: ["integer", "null"] },

    // Timing
    time_elapsed: { type: "integer", description: "Minute" },
    time_extra: { type: ["integer", "null"], description: "Extra time" },

    // Team meta
    team_name: { type: ["string", "null"], maxLength: 100 },
    team_logo: { type: ["string", "null"], format: "uri", maxLength: 255 },

    // Players
    player_id: { type: ["integer", "null"] },
    player_name: { type: ["string", "null"], maxLength: 100 },

    assist_id: { type: ["integer", "null"] },
    assist_name: { type: ["string", "null"], maxLength: 100 },

    // Event info
    type: { type: ["string", "null"], maxLength: 50 },
    detail: { type: ["string", "null"], maxLength: 50 },
    comments: { type: ["string", "null"], maxLength: 255 },
  },
};

const Event = {
  allOf: [{ $ref: "#/docs/schemas/EventBase" }],
};

const EventCreate = {
  allOf: [
    { $ref: "#/docs/schemas/EventBase" },
    {
      type: "object",
      required: ["fixture_id", "time_elapsed", "type", "detail"],
    },
  ],
};

const EventPatch = {
  type: "object",
  properties: EventBase.properties,
};

const EventsList = {
  type: "array",
  items: { $ref: "#/docs/schemas/Event" },
};

module.exports = {
  EventBase,
  Event,
  EventCreate,
  EventPatch,
  EventsList,
};
