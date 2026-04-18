module.exports = {
  apps: [
    {
      name: "encar-korea",
      namespace: "sites",
      script: "node_modules/.bin/next",
      args: "start --port 3850",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        PORT: "3850",
      },
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "256M",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
