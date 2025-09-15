// src/docs/schemas/auth.schemas.js
// OpenAPI component schemas for authentication flows

module.exports = {
  LoginRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 6 },
    },
  },

  AuthTokenResponse: {
    type: "object",
    properties: {
      accessToken: { type: "string" },
      tokenType: { type: "string", example: "Bearer" },
      // expiresIn can be included if you expose it
      // expiresIn: { type: "integer", description: "Seconds until expiry" },
      user: { $ref: "#/components/schemas/User" },
    },
  },

  TestTokenResponse: {
    type: "object",
    properties: {
      valid: { type: "boolean" },
      user: { $ref: "#/components/schemas/User" },
    },
  },

  PasswordResetRequest: {
    type: "object",
    required: ["token", "newPassword"],
    properties: {
      token: { type: "string" },
      newPassword: { type: "string", minLength: 6 },
    },
  },

  PasswordRecoveryResponse: {
    type: "object",
    properties: {
      message: { type: "string" },
    },
  },

  TokenValidityResponse: {
    type: "object",
    properties: {
      valid: { type: "boolean" },
    },
  },

  MessageResponse: {
    type: "object",
    properties: {
      message: { type: "string" },
    },
  },

  ErrorResponse: {
    type: "object",
    properties: {
      name: { type: "string" },
      message: { type: "string" },
      code: { type: "integer" },
      className: { type: "string" },
      data: { type: "object", nullable: true },
      errors: { type: "object", nullable: true },
    },
  },
};
