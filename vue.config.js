module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  publicPath: process.env.NODE_ENV === 'production'
    ? '/tridoc-cockpit/'
    : '/',
  configureWebpack: {
    devtool: 'source-map'
  },
  pwa: {
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: './src/service-worker.ts'
    },
    name: 'Tridoc Cockpit',
    themeColor: '#00887b',
    manifestOptions: {
      short_name: 'Tridoc',
    },
  },
}
