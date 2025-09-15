// src/docs/paths/login.path.js
// OpenAPI paths for the "login" flows

const LoginRequest = { $ref: "#/components/schemas/LoginRequest" };
const AuthTokenResponse = { $ref: "#/components/schemas/AuthTokenResponse" };
const ErrorResponse = { $ref: "#/components/schemas/ErrorResponse" };
const TestTokenResponse = { $ref: "#/components/schemas/TestTokenResponse" };
const PasswordResetRequest = {
  $ref: "#/components/schemas/PasswordResetRequest",
};
const PasswordRecoveryResponse = {
  $ref: "#/components/schemas/PasswordRecoveryResponse",
};
const TokenValidityResponse = {
  $ref: "#/components/schemas/TokenValidityResponse",
};
const MessageResponse = { $ref: "#/components/schemas/MessageResponse" };

module.exports = {
  "/api/v1/login/access-token": {
    post: {
      tags: ["login"],
      summary: "Login Access Token",
      description: "Authenticate with email & password and receive a JWT.",
      operationId: "loginAccessToken",
      security: [], // public
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
          content: {
            "application/json": {
              schema: AuthTokenResponse,
              example: {
                accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                tokenType: "Bearer",
                user: {
                  user_id: 101,
                  email: "user@example.com",
                  role: "user",
                  is_active: true,
                  provider: "local",
                  provider_id: null,
                  last_login: "2025-09-15T15:20:30Z",
                  created_at: "2025-09-01T10:00:00Z",
                  updated_at: "2025-09-10T12:34:56Z",
                },
              },
            },
          },
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
      summary: "Test Token",
      description: "Verify a Bearer JWT and return the associated user.",
      operationId: "testToken",
      security: [{ bearer: [] }], // requires Bearer
      responses: {
        200: {
          description: "Token is valid",
          content: {
            "application/json": {
              schema: TestTokenResponse,
              example: {
                valid: true,
                user: { user_id: 2, email: "admin@example.com", role: "admin" },
              },
            },
          },
        },
        401: {
          description: "Missing or invalid token",
          content: { "application/json": { schema: ErrorResponse } },
        },
      },
    },
  },

  "/api/v1/password-recovery/{email}": {
    post: {
      tags: ["login"],
      summary: "Recover Password",
      description:
        "Request a password reset email. Always returns 200 to avoid account enumeration.",
      operationId: "passwordRecovery",
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
          content: {
            "application/json": {
              schema: PasswordRecoveryResponse,
              example: {
                message:
                  "If an account with that email exists, a password recovery email has been sent.",
              },
            },
          },
        },
        429: {
          description: "Too many requests",
          content: { "application/json": { schema: ErrorResponse } },
        },
      },
    },
  },

  "/api/v1/reset-password/": {
    post: {
      tags: ["login"],
      summary: "Reset Password",
      description:
        "Reset password using a one-time token and a new password (min length enforced).",
      operationId: "resetPassword",
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
          content: {
            "application/json": {
              schema: MessageResponse,
              example: { message: "Password has been updated." },
            },
          },
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
      summary: "Reset Password Check Token",
      description: "Lightweight validity check for a reset token.",
      operationId: "checkResetToken",
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
          content: {
            "application/json": {
              schema: TokenValidityResponse,
              example: { valid: true },
            },
          },
        },
      },
    },
  },
};
