// Feathers Knex service class for `countries`

const { KnexService } = require("@feathersjs/knex");

class CountriesService extends KnexService {
  // You can override Feathers service methods if needed
  // async create(data, params) { ... }
}

module.exports = {
  CountriesService,
};
