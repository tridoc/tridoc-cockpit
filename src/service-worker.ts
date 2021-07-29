const sw = self as unknown as ServiceWorkerGlobalScope;

// eslint-disable-next-line no-console
console.log('???')

import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';
import { Plugin } from 'workbox-expiration';
import { precacheAndRoute } from 'workbox-precaching';

precacheAndRoute((sw as any).serviceWorkerOption.assets);

registerRoute(
    /\.(?:png|gif|jpg|jpeg|svg)$/,
    new StaleWhileRevalidate({
        cacheName: 'images',
        plugins: [
            new Plugin({
                maxEntries: 60,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
            }),
        ],
    })
);