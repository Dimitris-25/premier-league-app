// Minimal schemas for Transfers (docs)

const TransferBase = {
  type: "object",
  properties: {
    transfer_id: { type: "integer", readOnly: true },
    player_id: { type: ["integer", "null"] },
    team_in_id: { type: ["integer", "null"] },
    team_out_id: { type: ["integer", "null"] },
    date: { type: ["string", "null"], format: "date" },
    type: { type: ["string", "null"] },
    update_date: { type: ["string", "null"], format: "date-time" },
  },
};

const Transfer = { allOf: [{ $ref: "#/docs/schemas/TransferBase" }] };
const TransferCreate = {
  allOf: [
    { $ref: "#/docs/schemas/TransferBase" },
    { type: "object", required: ["player_id", "date"] },
  ],
};
const TransferPatch = { type: "object", properties: TransferBase.properties };
const TransferList = {
  type: "array",
  items: { $ref: "#/docs/schemas/Transfer" },
};

module.exports = {
  TransferBase,
  Transfer,
  TransferCreate,
  TransferPatch,
  TransferList,
};
