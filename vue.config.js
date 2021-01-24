module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  publicPath: process.env.NODE_ENV === 'production'
    ? '/tridoc-cockpit/'
    : '/',
  configureWebpack: {
    devtool: 'source-map'
  }
}
