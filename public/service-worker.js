const CACHE_PREFIX = 'cornhole-scorekeeper';
const CACHE_VERSION = 'v1';
const CACHE_NAME = `${CACHE_PREFIX}-${CACHE_VERSION}`;
const OFFLINE_PAGE = 'offline-shell';

const scopeUrl = new URL(self.location.href);
const scopePath = scopeUrl.pathname.replace(/service-worker\.js$/, '');

function joinScope(pathname = '') {
  const normalizedScope = scopePath.endsWith('/') ? scopePath : `${scopePath}/`;
  const normalizedPath = pathname.replace(/^\//, '');
  return new URL(normalizedPath, `${scopeUrl.origin}${normalizedScope}`).toString();
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll([
        joinScope(),
        joinScope('manifest.webmanifest'),
        joinScope('icons/icon.svg'),
        joinScope('icons/icon-maskable.svg'),
      ]),
    ),
  );

  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME) {
            return caches.delete(key);
          }

          return Promise.resolve(false);
        }),
      ),
    ),
  );

  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(request.url);

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request));
    return;
  }

  event.respondWith(handleAsset(request));
});

async function handleNavigation(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);

    if (response.ok) {
      await cache.put(OFFLINE_PAGE, response.clone());
    }

    return response;
  } catch {
    const cachedResponse =
      (await cache.match(request, { ignoreSearch: true })) ||
      (await cache.match(OFFLINE_PAGE)) ||
      (await cache.match(joinScope()));

    if (cachedResponse) {
      return cachedResponse;
    }

    throw new Error('Navigation request failed and no cached shell is available.');
  }
}

async function handleAsset(request) {
  const cachedResponse = await caches.match(request, { ignoreSearch: true });

  if (cachedResponse) {
    void refreshAsset(request);
    return cachedResponse;
  }

  const response = await fetch(request);

  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  }

  return response;
}

async function refreshAsset(request) {
  try {
    const response = await fetch(request);

    if (!response.ok) {
      return;
    }

    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response);
  } catch {
    return;
  }
}
