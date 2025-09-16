// src/docs/schemas/playersTopStats.schema.js
// OpenAPI schemas for PlayersTopStats (docs folder)

const PlayersTopStatsBase = {
  type: "object",
  properties: {
    topstat_id: { type: "integer", readOnly: true },
    league_id: { type: "integer" },
    season_id: { type: "integer" },
    player_id: { type: "integer" },
    team_id: { type: "integer" },
    goals_total: { type: "integer" },
    assists_total: { type: "integer" },
    yellow_cards: { type: "integer" },
    red_cards: { type: "integer" },
    rank: { type: ["integer", "null"] },
  },
};

const PlayersTopStats = {
  allOf: [{ $ref: "#/docs/schemas/PlayersTopStatsBase" }],
};

const PlayersTopStatsCreate = {
  allOf: [
    { $ref: "#/docs/schemas/PlayersTopStatsBase" },
    {
      type: "object",
      required: ["league_id", "season_id", "player_id", "team_id"],
    },
  ],
};

const PlayersTopStatsPatch = {
  type: "object",
  properties: PlayersTopStatsBase.properties,
};

const PlayersTopStatsList = {
  type: "array",
  items: { $ref: "#/docs/schemas/PlayersTopStats" },
};

module.exports = {
  PlayersTopStatsBase,
  PlayersTopStats,
  PlayersTopStatsCreate,
  PlayersTopStatsPatch,
  PlayersTopStatsList,
};
