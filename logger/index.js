const { format, createLogger, transports } = require("winston");
const MySQLTransport = require("winston-mysql");
require("winston-daily-rotate-file");


// Create logger for daily report
const { combine, timestamp, label, prettyPrint } = format;

const CATEGORY = "Premier League API";

// ✅ Daily Rotate File
const fileRotateTransport = new transports.DailyRotateFile({
  filename: "logs/app-%DATE%.log",   // update log file every day
  datePattern: "YYYY-MM-DD",         // date format
  zippedArchive: true,               // create zip with the previous logs
  maxSize: "20m",                    // max log size
  maxFiles: "14d"                    // hold back up for 14 days
});

// ✅ MySQL options
const mysqlOptions = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  table: "app_logs"   // mysql table
};

// ✅Logger
const logger = createLogger({
  level: "debug",
  format: combine(
    label({ label: CATEGORY }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    prettyPrint()
  ),
  transports: [
    fileRotateTransport,                                // daily logs
    new transports.File({ filename: "logs/error.log", level: "error" }), // errors
    new transports.Console(),                           // terminal logs
    new MySQLTransport(mysqlOptions)                    // store logs in  MySQL
  ]
});

module.exports = logger;

