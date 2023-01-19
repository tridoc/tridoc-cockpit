// Default type of `self` is `WorkerGlobalScope & typeof globalThis`
// https://github.com/microsoft/TypeScript/issues/14877
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import Hash from 'ipfs-only-hash'

declare const self: ServiceWorkerGlobalScope;

// Use the imported Workbox libraries to implement caching,
// routing, and other logic:
precacheAndRoute((self as any).__WB_MANIFEST);

// Cache the Google Fonts stylesheets with a stale-while-revalidate strategy.
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.href === 'https://rsms.me/inter/inter.css' || url.href === 'https://cdn.jsdelivr.net/npm/@mdi/font@latest/css/materialdesignicons.min.css',
  new StaleWhileRevalidate({
    cacheName: 'font-stylesheets',
  })
);

// Cache the underlying font files with a cache-first strategy for 1 year.
registerRoute(
  ({ url }) => url.origin === 'https://fonts.gstatic.com' || ((url.origin === 'https://rsms.me' || url.origin === 'https://cdn.jsdelivr.net') && url.search),
  new CacheFirst({
    cacheName: 'font-webfonts',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * 365,
        maxEntries: 30,
      }),
    ],
  })
);

function computeFileHash (blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const hash = await Hash.of(new Uint8Array(reader.result as ArrayBuffer)) as string
      resolve(hash)
    };
    reader.readAsArrayBuffer(blob);
  });
}

const ipfsCache = new Map<string, Blob>();

self.addEventListener('fetch', async (event) => {
  console.log(`fetch: ${event.request.method} ${event.request.url}`)
  const url = new URL(event.request.url);

  // Don't care about other-origin URLs
  if (url.origin !== location.origin) return;

  if (url.pathname === '/editor') {
    event.respondWith(Response.redirect('/'));
    return;
  }

  if (url.pathname.startsWith('/ipfs/')) {
    const key = url.pathname.substring(6);
    if (event.request.method === 'GET') {
      event.respondWith((async () => {
        if (ipfsCache.has(key)) {
          const blob: Blob = ipfsCache.get(key) as Blob
          console.log(`the blob has length: ${(await blob.arrayBuffer()).byteLength} and type ${blob.type}`)
          return new Response(blob, { headers: new Headers({ 'Content-Type': 'application/pdf' }) });
        } else {
          return new Response('No such object in share-target cache.', { status: 404 })
        }
      })());
    } else if (event.request.method === 'DELETE') {
      ipfsCache.delete(key);
      event.respondWith(new Response('', { status: 201 }));
    }
    return;
  }
  if (
    url.pathname === '/' &&
    url.searchParams.has('share-target') &&
    event.request.method === 'POST'
  ) {
    // eslint-disable-next-line no-async-promise-executor
    event.respondWith((async () => {
      const dataPromise = event.request.formData();
      const formData = await dataPromise;
      const file = formData.get('file') as Blob;
      console.log(`will store blob of length: ${(await file.arrayBuffer()).byteLength} `)
      const fileHash = await computeFileHash(file)
      ipfsCache.set(fileHash, file)
      console.log(`stored blob of length: ${(await file.arrayBuffer()).byteLength} for ${fileHash}`)
      return Response.redirect(`/share-target?file=${fileHash}`)
    })())
  }
});
