// src/docs/paths/login.path.js
// OpenAPI paths for the "login" flows (always exposed)

const LoginRequest = { $ref: "#/docs/schemas/LoginRequest" };
const AuthTokenResponse = { $ref: "#/docs/schemas/AuthTokenResponse" };
const ErrorResponse = { $ref: "#/docs/schemas/ErrorResponse" };
const TestTokenResponse = { $ref: "#/docs/schemas/TestTokenResponse" };
const PasswordResetRequest = {
  $ref: "#/docs/schemas/PasswordResetRequest",
};
const PasswordRecoveryResponse = {
  $ref: "#/docs/schemas/PasswordRecoveryResponse",
};
const TokenValidityResponse = {
  $ref: "#/docs/schemas/TokenValidityResponse",
};
const MessageResponse = { $ref: "#/docs/schemas/MessageResponse" };

module.exports = {
  "/api/v1/login/access-token": {
    post: {
      tags: ["login"],
      summary: "Login & get JWT",
      description: "Authenticate with email & password and receive a JWT.",
      operationId: "login_access_token",
      security: [], // public (overrides global bearer)
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: LoginRequest,
            examples: {
              default: {
                value: { email: "user@example.com", password: "Secret123!" },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Successful authentication",
          content: { "application/json": { schema: AuthTokenResponse } },
        },
        401: {
          description: "Invalid credentials",
          content: { "application/json": { schema: ErrorResponse } },
        },
      },
    },
  },

  "/api/v1/login/test-token": {
    post: {
      tags: ["login"],
      summary: "Validate JWT",
      description: "Verify a Bearer JWT and return the associated user.",
      operationId: "login_test_token",
      security: [{ bearer: [] }], // requires Bearer
      responses: {
        200: {
          description: "Token is valid",
          content: { "application/json": { schema: TestTokenResponse } },
        },
        401: {
          description: "Missing or invalid token",
          content: { "application/json": { schema: ErrorResponse } },
        },
      },
    },
  },

  ["/api/v1/login/google"]: {
    get: {
      tags: ["login"],
      summary: "Login with Google (redirect)",
      description:
        "Starts the Google OAuth flow. If Google OAuth is not configured, returns 501.",
      operationId: "login_google",
      responses: {
        302: {
          description: "Redirect to Google OAuth consent page",
        },
        501: {
          description: "Google OAuth is not configured on the server",
        },
      },
    },
  },

  "/api/v1/password-recovery/{email}": {
    post: {
      tags: ["login"],
      summary: "Recover password",
      description:
        "Request a password reset email. Always returns 200 to avoid account enumeration.",
      operationId: "password_recovery",
      security: [], // public
      parameters: [
        {
          name: "email",
          in: "path",
          required: true,
          schema: { type: "string", format: "email" },
        },
      ],
      responses: {
        200: {
          description: "Generic success response",
          content: { "application/json": { schema: PasswordRecoveryResponse } },
        },
        429: {
          description: "Too many requests",
          content: { "application/json": { schema: ErrorResponse } },
        },
      },
    },
  },

  // No trailing slash for consistency with other paths
  "/api/v1/reset-password": {
    post: {
      tags: ["login"],
      summary: "Reset password",
      description:
        "Reset password using a one-time token and a new password (minimum length enforced).",
      operationId: "reset_password",
      security: [], // public
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: PasswordResetRequest,
            examples: {
              default: {
                value: {
                  token: "raw-token-from-email",
                  newPassword: "NewSecret!234",
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Password changed",
          content: { "application/json": { schema: MessageResponse } },
        },
        400: {
          description: "Invalid or expired token / weak password",
          content: { "application/json": { schema: ErrorResponse } },
        },
        429: {
          description: "Too many requests",
          content: { "application/json": { schema: ErrorResponse } },
        },
      },
    },
  },

  "/api/v1/reset-password/{token}": {
    get: {
      tags: ["login"],
      summary: "Check reset token",
      description: "Lightweight validity check for a password reset token.",
      operationId: "reset_password_check",
      security: [], // public
      parameters: [
        {
          name: "token",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Token validity",
          content: { "application/json": { schema: TokenValidityResponse } },
        },
      },
    },
  },
};
