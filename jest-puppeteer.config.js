module.exports = {
    server: {
      command: 'npm run test-server',
      port: 9000,
      launchTimeout: 30000,
    },
    launch: {
      headless: true,
      timeout: 300000,
    },
  }