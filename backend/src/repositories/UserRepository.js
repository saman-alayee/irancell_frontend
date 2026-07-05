const User = require('../models/User');
const BaseRepository = require('./BaseRepository');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByMobile(mobile) {
    return this.model.findOne({ mobile }).select('+password');
  }

  async findByMobilePublic(mobile) {
    return this.model.findOne({ mobile });
  }
}

module.exports = new UserRepository();
