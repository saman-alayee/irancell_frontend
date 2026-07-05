const adminRepository = require('../repositories/AdminRepository');
const { signToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');

class AuthService {
  async login(email, password) {
    const normalizedEmail = String(email || '').toLowerCase().trim();
    const admin = await adminRepository.findByEmail(normalizedEmail);
    if (!admin) throw new AppError('Invalid credentials', 401);

    const valid = await admin.comparePassword(String(password || ''));
    if (!valid) throw new AppError('Invalid credentials', 401);

    const token = signToken({ id: admin._id, email: admin.email, role: 'admin' });

    return {
      token,
      admin: { id: admin._id, email: admin.email, name: admin.name },
    };
  }

  async getProfile(adminId) {
    const admin = await adminRepository.findById(adminId);
    if (!admin) throw new AppError('Admin not found', 404);
    return { id: admin._id, email: admin.email, name: admin.name };
  }
}

module.exports = new AuthService();
