const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    allowedHosts: 'all', // Allow all hosts
    // disableHostCheck: true,
    // OR if you prefer to only allow specific hosts, use:
    // allowedHosts: ['Jetsuns-MacBook-Air.local', 'localhost'],
  }
})
