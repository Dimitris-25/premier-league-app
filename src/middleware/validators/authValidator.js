// src/middleware/validators/authValidators.js
// Auth-specific schemas

const { z, validateBody, validateParams } = require("./zod");

const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const resetPasswordSchema = z.object({
  token: z.string().min(10),
  newPassword: z.string().min(8),
});

const emailParamSchema = z.object({
  email: z.string().email(),
});

const tokenParamSchema = z.object({
  token: z.string().min(10),
});

module.exports = {
  loginBody: validateBody(loginRequestSchema),
  resetBody: validateBody(resetPasswordSchema),
  emailParam: validateParams(emailParamSchema),
  tokenParam: validateParams(tokenParamSchema),
};
