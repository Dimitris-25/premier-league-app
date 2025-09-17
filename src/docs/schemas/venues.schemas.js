// OpenAPI component schemas for Venues
const VenueBase = {
  type: "object",
  properties: {
    venue_id: { type: "integer", readOnly: true },
    api_venue_id: { type: ["integer", "null"] },
    name: { type: "string" },
    address: { type: ["string", "null"] },
    capacity: { type: ["integer", "null"] },
    surface: { type: ["string", "null"] },
    image: { type: ["string", "null"], format: "uri" },
    city_id: { type: ["integer", "null"] },
    country_id: { type: ["integer", "null"] },
  },
};

const Venue = {
  allOf: [{ $ref: "#/components/schemas/VenueBase" }],
};

const VenueCreate = {
  allOf: [
    { $ref: "#/components/schemas/VenueBase" },
    { type: "object", required: ["name"] },
  ],
};

const VenuePatch = {
  type: "object",
  properties: VenueBase.properties,
};

const VenueList = {
  type: "array",
  items: { $ref: "#/components/schemas/Venue" },
};

module.exports = {
  VenueBase,
  Venue,
  VenueCreate,
  VenuePatch,
  VenueList,
};
