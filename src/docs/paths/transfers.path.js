// Curated Transfers paths (docs). Read-only by default; writes if exposeWrites=true.
module.exports = (exposeWrites = false) => {
  const BASE = "/api/v1/transfers";

  const paths = {
    [BASE]: {
      get: {
        tags: ["transfers"],
        summary: "List all transfers",
        operationId: "transfers_find",
        responses: {
          200: {
            description: "Array of transfers",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TransferList" },
              },
            },
          },
        },
      },
    },
    [`${BASE}/{transfer_id}`]: {
      get: {
        tags: ["transfers"],
        summary: "Get transfer by ID",
        operationId: "transfers_get",
        parameters: [
          {
            name: "transfer_id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Single transfer",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Transfer" },
              },
            },
          },
          404: { description: "Not found" },
        },
      },
    },
  };

  if (exposeWrites) {
    paths[BASE].post = {
      tags: ["transfers"],
      summary: "Create transfer",
      operationId: "transfers_create",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/TransferCreate" },
          },
        },
      },
      responses: {
        201: { description: "Created" },
        400: { description: "Validation error" },
      },
    };

    paths[`${BASE}/{transfer_id}`].patch = {
      tags: ["transfers"],
      summary: "Update transfer",
      operationId: "transfers_patch",
      parameters: [
        {
          name: "transfer_id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/TransferPatch" },
          },
        },
      },
      responses: {
        200: { description: "Updated" },
        404: { description: "Not found" },
      },
    };

    paths[`${BASE}/{transfer_id}`].delete = {
      tags: ["transfers"],
      summary: "Delete transfer",
      operationId: "transfers_remove",
      parameters: [
        {
          name: "transfer_id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      responses: {
        200: { description: "Deleted" },
        404: { description: "Not found" },
      },
    };
  }

  return paths;
};
