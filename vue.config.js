const {InjectManifest} = require('workbox-webpack-plugin');

const PATH = process.env.NODE_ENV === 'production'
    ? '/tridoc-cockpit/'
    : '/'

module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  publicPath: PATH,
  configureWebpack: {
    devtool: 'source-map',
    plugins: [
      new InjectManifest({
        swSrc: './src/serviceworker/sw.ts',
        additionalManifestEntries: [
          { url: PATH + 'js/chunk-vendors.js', revision: '0' }
        ]
      })
    ]  
  }
}
