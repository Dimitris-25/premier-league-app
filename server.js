// Entry point to start the Feathers application
const app = require("./src/app");
const logger = require("./src/logger");

const port = process.env.PORT || 3030;

// Start Feathers app
app.listen(port);

// Log when server is listening
app.on("listening", () => {
  logger.info(`Feathers app running at http://localhost:${port}`);
  console.log(`Server: http://localhost:${port}`);
  console.log(`Docs:   http://localhost:${port}/docs`);
});

// Log unexpected errors
app.on("error", (err) => {
  logger.error(`Feathers app error: ${err.message}`);
});
