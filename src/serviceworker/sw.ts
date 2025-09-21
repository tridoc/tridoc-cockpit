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
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB limit for PDF files

self.addEventListener('fetch', async (event) => {
  // console.log(`fetch: ${event.request.method} ${event.request.url}`)
  const url = new URL(event.request.url);

  // Don't care about other-origin URLs
  if (url.origin !== location.origin) return;

  const key = url.pathname.split('/ipfs/')[1];
  if (key) {
    if (event.request.method === 'GET') {
      event.respondWith((async () => {
        if (ipfsCache.has(key)) {
          const blob: Blob = ipfsCache.get(key) as Blob
          return new Response(blob, { 
            headers: new Headers({ 
              'Content-Type': 'application/pdf',
              'Content-Length': blob.size.toString()
            }) 
          });
        } else {
          return new Response('File not found in share-target cache. It may have expired.', { 
            status: 404,
            headers: { 'Content-Type': 'text/plain' }
          })
        }
      })());
    } else if (event.request.method === 'DELETE') {
      ipfsCache.delete(key);
      event.respondWith(new Response('', { status: 204 }));
    }
    return;
  }
  
  if (
    url.searchParams.has('share-target') &&
    event.request.method === 'POST'
  ) {
    event.respondWith((async () => {
      try {
        const formData = await event.request.formData();
        const file = formData.get('file') as Blob;
        
        if (!file) {
          return new Response('No file provided', { status: 400 });
        }
        
        // Validate file size (reasonable limit for PDFs)
        if (file.size > MAX_FILE_SIZE) {
          return new Response(`PDF file too large (${Math.round(file.size / 1024 / 1024)}MB). Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`, { 
            status: 413 
          });
        }
        
        // Basic PDF validation
        if (file.type && file.type !== 'application/pdf') {
          console.warn(`Unexpected file type: ${file.type}, expected PDF`);
        }
        
        const fileHash = await computeFileHash(file);
        ipfsCache.set(fileHash, file);
        
        return Response.redirect(`./share-target?file=${fileHash}`);
      } catch (error) {
        console.error('Share target error:', error);
        return new Response('Failed to process shared PDF file', { status: 500 });
      }
    })());
  }
});
