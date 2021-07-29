/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="WebWorker" />
const sw = self as unknown as ServiceWorkerGlobalScope;

const VERSION = '1:'
const CACHE_DIST = 'cache-update-and-refresh'
const CACHE_DATA = 'cache-update-and-refresh'

sw.addEventListener('install', event => {
  console.log('The service worker is being installed.')
  event.waitUntil(caches.open(CACHE_DIST).then(cache => {
    cache.addAll([
      './index.html',
    ])
  }))
})

sw.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => {
      // Remove caches whose name is no longer valid
      return Promise.all(
        keys
          .filter(function (key) {
            return key.indexOf(VERSION) !== 0
          })
          .map(function (key) {
            return caches.delete(key)
          })
      )
    })
  )
})