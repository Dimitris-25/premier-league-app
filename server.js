// server.js
const app = require("./src/app");
const logger = require("./src/logger");

const port = process.env.PORT || 3030;
const host = `http://localhost:${port}`;

// Start app
app.listen(port);

// Log when server is listening
app.on("listening", () => {
  logger.info(`Feathers app running at ${host}`);
  console.log(`Server: ${host}`);
  console.log(`Docs:   ${host}/docs`);
});

// Log unexpected errors
app.on("error", (err) => {
  logger.error(`Feathers app error: ${err.message}`);
});
