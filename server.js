// Entry point to start the Feathers application

const app = require("./src/app");
const logger = require("./src/logger");

const port = process.env.PORT || 3030;

// Start server
app.listen(port);

// Log when server is listening
app.on("listening", () => {
  logger.info(`Feathers app running at http://localhost:${port}`);
});

// Log unexpected errors
app.on("error", (err) => {
  logger.error(`Feathers app error: ${err.message}`);
});
