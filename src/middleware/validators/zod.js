// src/middleware/validators/zod.js
// Thin Zod wrapper for Express/Feathers (body/params/header).

const { z } = require("zod");

function validateBody(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body ?? {});
      next();
    } catch (e) {
      return res.status(400).json({
        statusCode: 400,
        error: "Bad Request",
        message: e?.errors?.[0]?.message || "Invalid request body.",
      });
    }
  };
}

function validateParams(schema) {
  return (req, res, next) => {
    try {
      req.params = schema.parse(req.params ?? {});
      next();
    } catch (e) {
      return res.status(400).json({
        statusCode: 400,
        error: "Bad Request",
        message: e?.errors?.[0]?.message || "Invalid path parameters.",
      });
    }
  };
}

module.exports = { z, validateBody, validateParams };
