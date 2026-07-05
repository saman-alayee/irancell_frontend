module.exports = {
  apps: [
    {
      name: 'irancell-api',
      cwd: '/var/www/irancell/backend',
      script: 'src/server.js',
      instances: 1,
      autorestart: true,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'irancell-web',
      cwd: '/var/www/irancell/frontend',
      script: '.output/server/index.mjs',
      instances: 1,
      autorestart: true,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        NITRO_PORT: 3000,
        NITRO_HOST: '127.0.0.1',
      },
    },
  ],
};
