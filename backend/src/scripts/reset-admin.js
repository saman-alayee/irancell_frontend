require('dotenv').config();
const { connectDB } = require('../config/database');
const Admin = require('../models/Admin');

const resetAdmin = async () => {
  await connectDB();

  const email = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD || 'admin123456';
  const name = process.env.ADMIN_NAME || 'مدیر سیستم';

  let admin = await Admin.findOne({ email });

  if (admin) {
    admin.password = password;
    admin.name = name;
    await admin.save();
    console.log('Admin password reset:', email);
  } else {
    admin = await Admin.create({ email, password, name });
    console.log('Admin created:', email);
  }

  console.log('Login with:');
  console.log('  Email:', email);
  console.log('  Password:', password);
  process.exit(0);
};

resetAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
