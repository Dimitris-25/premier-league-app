// Winston logger with daily rotate file transport

const { createLogger, format, transports } = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const path = require("path");

// Define log format with timestamp, level and message
const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.printf(
    ({ timestamp, level, message }) =>
      `[${timestamp}] ${level.toUpperCase()}: ${message}`
  )
);

// Create logger instance
const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  transports: [
    // Console output
    new transports.Console({
      format: format.combine(format.colorize(), logFormat),
    }),

    // Daily rotating log file
    new DailyRotateFile({
      filename: path.join(__dirname, "../../logs/app-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true, // compress old log files
      maxSize: "10m", // max size per log file
      maxFiles: "14d", // keep logs for 14 days
    }),
  ],
  exitOnError: false,
});

module.exports = logger;
