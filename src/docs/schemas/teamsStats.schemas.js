// Minimal schemas for Team Stats (files importer) — docs

const TeamStatsBase = {
  type: "object",
  properties: {
    stats_id: { type: "integer", readOnly: true },
    league_id: { type: "integer" },
    team_id: { type: "integer" },
    season: { type: "integer" },
  },
};

const TeamStats = { allOf: [{ $ref: "#/docs/schemas/TeamStatsBase" }] };
const TeamStatsCreate = {
  allOf: [
    { $ref: "#/docs/schemas/TeamStatsBase" },
    { type: "object", required: ["league_id", "team_id", "season"] },
  ],
};
const TeamStatsPatch = { type: "object", properties: TeamStatsBase.properties };
const TeamStatsList = {
  type: "array",
  items: { $ref: "#/docs/schemas/TeamStats" },
};

module.exports = {
  TeamStatsBase,
  TeamStats,
  TeamStatsCreate,
  TeamStatsPatch,
  TeamStatsList,
};
