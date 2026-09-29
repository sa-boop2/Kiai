import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Files in /public that must be available offline. Hashed JS/CSS bundles are added automatically.
 */
const PUBLIC_PRECACHE = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icons/favicon.svg',
  'icons/icon-32.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-512.png',
  'icons/apple-touch-icon.png',
]

/** Tiny stable string hash (djb2) — used to version the offline cache per build. */
function hash(input: string): string {
  let h = 5381
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h + input.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}

/**
 * Zero-dependency service worker generator.
 * Emits `sw.js` at build time with a precache list of every emitted asset, so the core app works
 * fully offline after the first visit. A new build => new cache name => old caches are cleaned up.
 */
function kiaiServiceWorker(): Plugin {
  return {
    name: 'kiai-service-worker',
    apply: 'build',
    generateBundle(_options, bundle) {
      const assets = Object.keys(bundle).filter((file) => !file.endsWith('.map'))
      const precache = [...new Set([...PUBLIC_PRECACHE, ...assets])]
      // Bump SW_REVISION whenever the caching logic below changes.
      const SW_REVISION = 22
      const version = hash(`${SW_REVISION}|${precache.join('|')}`)
      const source = `/* Kiai service worker — generated at build time. */
const CACHE = 'kiai-${version}';
const PRECACHE = ${JSON.stringify(precache)};
// Hosts may send \`Vary: Origin\`/\`Accept-Encoding\`; crossorigin module scripts carry an Origin
// header, so exact Vary matching would miss offline. Assets are content-hashed, so ignore Vary.
const MATCH = { ignoreSearch: true, ignoreVary: true };
const SHELL = () => new URL('index.html', self.registration.scope).href;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('kiai-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // App shell: network first (so updates arrive quickly) with a short timeout, so a flaky
  // connection still opens instantly from the cached shell; fully offline uses the cache.
  if (request.mode === 'navigate') {
    const network = fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(SHELL(), copy));
      }
      return response;
    });
    const networkOrNothing = network.catch(() => undefined);
    const timeout = new Promise((resolve) => setTimeout(resolve, 1500));
    event.respondWith(
      Promise.race([networkOrNothing, timeout]).then(
        (response) => response || caches.match(SHELL(), MATCH).then((cached) => cached || network)
      )
    );
    return;
  }

  // Static assets: cache first (they are content-hashed), then network with runtime caching.
  event.respondWith(
    caches.match(request, MATCH).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok && response.type === 'basic') {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
`
      this.emitFile({ type: 'asset', fileName: 'sw.js', source })
    },
  }
}

// `base: './'` makes every URL relative, so the same build works at a domain root or under a
// GitHub Pages project path like https://user.github.io/repo/ without extra configuration.
export default defineConfig({
  base: './',
  plugins: [react(), kiaiServiceWorker()],
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
  build: {
    target: 'es2020',
    cssTarget: ['chrome100', 'safari15'],
    sourcemap: false,
  },
})


