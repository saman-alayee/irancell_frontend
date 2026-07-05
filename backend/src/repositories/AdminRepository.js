const Admin = require('../models/Admin');
const BaseRepository = require('./BaseRepository');

class AdminRepository extends BaseRepository {
  constructor() {
    super(Admin);
  }

  async findByEmail(email) {
    return this.model.findOne({ email: email.toLowerCase() });
  }
}

module.exports = new AdminRepository();
