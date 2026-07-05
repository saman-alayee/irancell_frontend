const Otp = require('../models/Otp');
const BaseRepository = require('./BaseRepository');

class OtpRepository extends BaseRepository {
  constructor() {
    super(Otp);
  }

  async invalidateAll(mobile, purpose) {
    return this.model.deleteMany({ mobile, purpose });
  }

  async findValid(mobile, purpose) {
    return this.model.findOne({
      mobile,
      purpose,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });
  }

  async findRecent(mobile, purpose, withinSeconds) {
    const since = new Date(Date.now() - withinSeconds * 1000);
    return this.model.findOne({
      mobile,
      purpose,
      createdAt: { $gte: since },
    });
  }

  async incrementAttempts(id) {
    return this.model.findByIdAndUpdate(id, { $inc: { attempts: 1 } });
  }
}

module.exports = new OtpRepository();
