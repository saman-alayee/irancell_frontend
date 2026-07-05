require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/database');
const config = require('./config');

const start = async () => {
  await connectDB();
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
