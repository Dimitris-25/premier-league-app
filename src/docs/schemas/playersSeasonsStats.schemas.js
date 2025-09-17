// src/docs/schemas/playersSeasonStats.schema.js
// OpenAPI schemas for PlayersSeasonStats (docs folder)

const PlayersSeasonsStatsBase = {
  type: "object",
  properties: {
    pss_id: { type: "integer", readOnly: true },
    player_id: { type: "integer" },
    team_id: { type: "integer" },
    league_id: { type: "integer" },
    season: { type: "integer" },

    // Games
    games_appearences: { type: ["integer", "null"] },
    games_lineups: { type: ["integer", "null"] },
    games_minutes: { type: ["integer", "null"] },
    games_number: { type: ["integer", "null"] },
    games_position: { type: ["string", "null"] },
    games_rating: { type: ["number", "null"], format: "float" },
    games_captain: { type: ["boolean", "null"] },

    // Substitutes
    subs_in: { type: ["integer", "null"] },
    subs_out: { type: ["integer", "null"] },
    subs_bench: { type: ["integer", "null"] },

    // Shots
    shots_total: { type: ["integer", "null"] },
    shots_on: { type: ["integer", "null"] },

    // Goals
    goals_total: { type: ["integer", "null"] },
    goals_conceded: { type: ["integer", "null"] },
    goals_assists: { type: ["integer", "null"] },
    goals_saves: { type: ["integer", "null"] },

    // Passes
    passes_total: { type: ["integer", "null"] },
    passes_key: { type: ["integer", "null"] },
    passes_accuracy: { type: ["integer", "null"] },

    // Tackles
    tackles_total: { type: ["integer", "null"] },
    tackles_blocks: { type: ["integer", "null"] },
    tackles_interceptions: { type: ["integer", "null"] },

    // Duels
    duels_total: { type: ["integer", "null"] },
    duels_won: { type: ["integer", "null"] },

    // Dribbles
    dribbles_attempts: { type: ["integer", "null"] },
    dribbles_success: { type: ["integer", "null"] },
    dribbles_past: { type: ["integer", "null"] },

    // Fouls
    fouls_drawn: { type: ["integer", "null"] },
    fouls_committed: { type: ["integer", "null"] },

    // Cards
    cards_yellow: { type: ["integer", "null"] },
    cards_yellowred: { type: ["integer", "null"] },
    cards_red: { type: ["integer", "null"] },

    // Penalties
    penalty_won: { type: ["integer", "null"] },
    penalty_commited: { type: ["integer", "null"] },
    penalty_scored: { type: ["integer", "null"] },
    penalty_missed: { type: ["integer", "null"] },
    penalty_saved: { type: ["integer", "null"] },
  },
};

const PlayersSeasonsStats = {
  allOf: [{ $ref: "#/docs/schemas/PlayersSeasonsStatsBase" }],
};

const PlayersSeasonStatsCreate = {
  allOf: [
    { $ref: "#/docs/schemas/PlayersSeasonsStatsBase" },
    {
      type: "object",
      required: ["player_id", "team_id", "league_id", "season"],
    },
  ],
};

const PlayersSeasonStatsPatch = {
  type: "object",
  properties: PlayersSeasonsStatsBase.properties,
};

const PlayersSeasonsStatsList = {
  type: "array",
  items: { $ref: "#/docs/schemas/PlayersSeasonsStats" },
};

module.exports = {
  PlayersSeasonsStatsBase,
  PlayersSeasonsStats,
  PlayersSeasonStatsCreate,
  PlayersSeasonStatsPatch,
  PlayersSeasonsStatsList,
};
