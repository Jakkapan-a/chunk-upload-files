module.exports = {
    apps : [{
      name   : "upload-file",
      script : "node",
      args   : "--env-file=.env dist/index.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      log_file: "logs/combined.log",
    }]
  };