const adminRepository = require('../repositories/AdminRepository');
const AppError = require('../utils/AppError');

class AdminManageService {
  async _getProtectedAdminId() {
    const first = await adminRepository.model.findOne().sort({ createdAt: 1 }).select('_id');
    return first?._id?.toString() || null;
  }

  _withProtection(admin, protectedId) {
    const obj = admin.toObject ? admin.toObject() : admin;
    return {
      ...obj,
      isProtected: protectedId ? obj._id?.toString() === protectedId : false,
    };
  }

  async list(options = {}) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;
    const protectedId = await this._getProtectedAdminId();
    const [items, total] = await Promise.all([
      adminRepository.model.find().select('-password').sort({ createdAt: 1 }).skip(skip).limit(limit),
      adminRepository.count(),
    ]);
    return {
      items: items.map((a) => this._withProtection(a, protectedId)),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async create({ email, password, name }) {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await adminRepository.findByEmail(normalizedEmail);
    if (existing) throw new AppError('این ایمیل قبلاً ثبت شده است', 409);

    const admin = await adminRepository.create({
      email: normalizedEmail,
      password,
      name,
    });

    return { id: admin._id, email: admin.email, name: admin.name };
  }

  async update(id, { name, password, email }) {
    const admin = await adminRepository.findById(id);
    if (!admin) throw new AppError('مدیر یافت نشد', 404);

    if (email && email.toLowerCase() !== admin.email) {
      const existing = await adminRepository.findByEmail(email);
      if (existing) throw new AppError('این ایمیل قبلاً ثبت شده است', 409);
      admin.email = email.toLowerCase();
    }
    if (name) admin.name = name;
    if (password) admin.password = password;
    await admin.save();

    return { id: admin._id, email: admin.email, name: admin.name };
  }

  async remove(id, currentAdminId) {
    const protectedId = await this._getProtectedAdminId();
    if (protectedId && id === protectedId) {
      throw new AppError('مدیر اصلی سیستم قابل حذف نیست', 400);
    }

    if (id === currentAdminId.toString()) {
      throw new AppError('نمی‌توانید حساب خود را حذف کنید', 400);
    }

    const count = await adminRepository.count();
    if (count <= 1) throw new AppError('حداقل یک مدیر باید وجود داشته باشد', 400);

    const deleted = await adminRepository.deleteById(id);
    if (!deleted) throw new AppError('مدیر یافت نشد', 404);
    return deleted;
  }
}

module.exports = new AdminManageService();
