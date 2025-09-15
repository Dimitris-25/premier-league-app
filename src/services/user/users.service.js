// src/services/users/users.service.js
const { UsersService } = require("./users.class");
const hooks = require("./hooks");

module.exports = function (app) {
  const knex = app.get("knex");

  const options = {
    Model: knex,
    name: "users",
    id: "user_id",
    multi: ["create", "patch", "remove"], // επιτρέπει bulk ops
  };

  // Register Feathers service at /users
  app.use("/users", new UsersService(options));

  // Hooks (θα τα προσθέσουμε αργότερα)
  const service = app.service("users");
  app.service("users").hooks(hooks);
};
