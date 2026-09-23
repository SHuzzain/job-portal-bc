module.exports = {
  apps: [
    {
      name: "job-portal-bc",
      script: "./.output/server/index.mjs", // 100% correct for Hono + Nitro!
      instances: 1,
      exec_mode: "fork",
      watch: false,
      max_memory_restart: "1G",
      restart_delay: 4000,
      autorestart: true,
      time: true, // Adds timestamps to your logs
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      merge_logs: true,
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
  ],
};