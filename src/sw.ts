import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';

console.log('Hyaa')

// Use the imported Workbox libraries to implement caching,
// routing, and other logic:
precacheAndRoute((self as any).__WB_MANIFEST);
