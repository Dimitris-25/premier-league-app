// src/docs/schemas/users.schemas.js
// OpenAPI 3.0-compliant user schemas (clean nullability, booleans, and readOnly/writeOnly)

// Common base for ALL user shapes used across requests/responses
const UserBase = {
  type: "object",
  additionalProperties: false, // Do not allow undeclared fields
  properties: {
    // Primary key (response-only)
    user_id: {
      type: "integer",
      format: "int32",
      readOnly: true,
      description: "Primary key",
    },

    // Identity
    email: {
      type: "string",
      format: "email",
      description: "Unique user email",
    },

    // Role/flags
    role: {
      type: "string",
      enum: ["admin", "user"],
      default: "user",
      description: "Access role",
    },
    // Expose booleans at the API level (DB can still use TINYINT(1))
    is_active: {
      type: "boolean",
      default: true,
      description: "Active user flag",
    },

    // Provider metadata (for social logins, etc.)
    provider: {
      type: "string",
      default: "local",
      description: "Auth provider",
    },
    provider_id: {
      type: "string",
      nullable: true, // OpenAPI 3 way to allow null
      description: "Provider-specific id (nullable)",
    },

    // Audit fields (response-only)
    last_login: {
      type: "string",
      format: "date-time",
      nullable: true,
      readOnly: true,
      description: "Last successful login timestamp (nullable)",
    },
    created_at: {
      type: "string",
      format: "date-time",
      readOnly: true,
      description: "Creation timestamp",
    },
    updated_at: {
      type: "string",
      format: "date-time",
      readOnly: true,
      description: "Last update timestamp",
    },

    // ➜ Add your remaining ~30 profile fields here (first_name, last_name, phone, timezone, etc.)
  },
};

// API response model (includes readOnly fields)
const User = {
  allOf: [
    { $ref: "#/docs/schemas/UserBase" },
    {
      type: "object",
      required: ["user_id", "email"],
      // You can add an example for better Swagger UX
      example: {
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
  ],
};

// Request body for creating a user (password is write-only)
const UserCreate = {
  allOf: [
    { $ref: "#/docs/schemas/UserBase" },
    {
      type: "object",
      required: ["email", "password"],
      properties: {
        password: {
          type: "string",
          minLength: 8,
          writeOnly: true,
          description: "User password (write-only)",
        },
      },
      example: {
        email: "new.user@example.com",
        password: "StrongPass!2025",
        role: "user",
        is_active: true,
      },
    },
  ],
};

// Request body for patching a user (all fields optional)
const UserPatch = {
  allOf: [
    { $ref: "#/docs/schemas/UserBase" },
    {
      type: "object",
      // No 'required' → all optional
      example: {
        role: "admin",
        is_active: false,
        provider_id: "oauth-12345",
      },
    },
  ],
};

module.exports = { UserBase, User, UserCreate, UserPatch };
