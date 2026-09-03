module.exports = {
  apps: [
    {
      name: 'college-fest-reimbursement',
      cwd: __dirname,
      script: 'npm',
      args: 'start',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: '3001',
        WACLI_COMMAND: '/home/ubuntu/.local/bin/wacli',
        WACLI_STORE_DIR: '/home/ubuntu/.local/state/wacli',
      },
    },
  ],
};
