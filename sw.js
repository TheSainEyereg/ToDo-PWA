const staticCacheName = 'olejka_todo_pwa';
const assets = [
  './',
  './index.html',
  './assets/main.js',
  './assets/style.css',
  './assets/fonts/VK-Sans-Display/VK-Sans-Display.css',
  './assets/fonts/VK-Sans-Display/VK-Sans-Display.woff2',
  './assets/fonts/Comfortaa/Comfortaa.css',
  './assets/fonts/Comfortaa/cyrillic.woff2',
  './assets/fonts/Comfortaa/cyrillic-ext.woff2',
  './assets/fonts/Comfortaa/latin.woff2',
  './assets/fonts/Comfortaa/latin-ext.woff2',
  './icons/icon.png' //XD 
];

let cache = {
  cache(e) {
    e.waitUntil(
      caches.open(staticCacheName).then((cache) => {
        cache.addAll(assets);
      })
    );
  },
  check(e) {
    e.waitUntil(
      caches.keys().then(keys => {
        return Promise.all(keys
          .filter(key => key !== staticCacheName)
          .map(key => caches.delete(key))
        );
      })
    );
  },
  load(e) {
    e.respondWith(
      caches.match(e.request).then(cacheRes => {
        return cacheRes || fetch(e.request);
      })
    );
  }
}

// событие install
self.addEventListener('install', e => {
  console.log('Caching shell assets');
  cache.cache(e)
});
// событие activate
self.addEventListener('activate', e => {
  console.log('Checking shell assets');
  cache.check(e)
});
// событие fetch
self.addEventListener('fetch', e => {
  if (!navigator.onLine) {
    console.log('Loading shell assets');
    cache.load(e)
  } else {
    console.log('You are online.')
    cache.cache(e)
  }
});