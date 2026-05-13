module.exports = {
  apps: [
    {
      name: 'tefa-frontend',
      cwd: '/root/tefa-dex/frontend',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'production'
      },
      watch: false,
      kill_timeout: 3000
    },
    {
      name: 'tefa-relayer',
      cwd: '/root/tefa-dex/relayer',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'production'
      },
      watch: false,
      kill_timeout: 3000
    }
  ]
};
