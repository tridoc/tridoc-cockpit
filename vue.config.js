const {InjectManifest} = require('workbox-webpack-plugin');

module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  publicPath: process.env.NODE_ENV === 'production'
    ? '/tridoc-cockpit/'
    : '/',
  configureWebpack: {
    devtool: 'source-map',
    plugins: [
      new InjectManifest({
        swSrc: './src/serviceworker/sw.ts',
        additionalManifestEntries: [
          { url: '/js/chunk-vendors.js', revision: '0' }
        ]
      })
    ]  
  }
}
