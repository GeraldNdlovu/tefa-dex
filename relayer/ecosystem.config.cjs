module.exports = { apps: [
  { name: 'tefa-api', script: './src/server.js', instances: 2, exec_mode: 'cluster', env: { NODE_ENV: 'production', PORT: 3001 } },
  { name: 'tefa-worker', script: './src/worker.js', instances: 2, exec_mode: 'cluster', env: { NODE_ENV: 'production' } }
] };
