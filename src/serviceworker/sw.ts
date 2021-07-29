// Default type of `self` is `WorkerGlobalScope & typeof globalThis`
// https://github.com/microsoft/TypeScript/issues/14877
import { precacheAndRoute } from 'workbox-precaching';

declare const self: ServiceWorkerGlobalScope;

// Use the imported Workbox libraries to implement caching,
// routing, and other logic:
precacheAndRoute((self as any).__WB_MANIFEST);
