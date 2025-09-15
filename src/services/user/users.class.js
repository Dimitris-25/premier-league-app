// src/services/users/users.class.js
class UsersService {
  constructor(options) {
    this.options = options;
    this.Model = options.Model; // Knex instance
    this.table = options.name; // "users"
    this.id = options.id; // "user_id"
  }

  // Standard CRUD
  async find(params) {
    return this.Model(this.table).select("*");
  }

  async get(id, params) {
    return this.Model(this.table).where(this.id, id).first();
  }

  async create(data, params) {
    const [inserted] = await this.Model(this.table).insert(data);
    return { ...data, [this.id]: inserted };
  }

  async patch(id, data, params) {
    await this.Model(this.table).where(this.id, id).update(data);
    return this.get(id);
  }

  async remove(id, params) {
    await this.Model(this.table).where(this.id, id).del();
    return { id };
  }
}

module.exports = { UsersService };
