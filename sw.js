const staticCacheName = "olejka_todo_pwa";
const assets = [
    "./",
    "./index.html",
    "./assets/main.js",
    "./assets/style.css",
    "./assets/fonts/VK-Sans-Display/VK-Sans-Display.css",
    "./assets/fonts/VK-Sans-Display/VK-Sans-Display.woff2",
    "./assets/fonts/Comfortaa/Comfortaa.css",
    "./assets/fonts/Comfortaa/cyrillic.woff2",
    "./assets/fonts/Comfortaa/cyrillic-ext.woff2",
    "./assets/fonts/Comfortaa/latin.woff2",
    "./assets/fonts/Comfortaa/latin-ext.woff2",
    "./icons/fav/icon.png", //XD
];

const cache = {
    cache(e) {
        e.waitUntil(
            caches.open(staticCacheName).then((cache) => {
                cache.addAll(assets);
            })
        );
    },
    check(e) {
        e.waitUntil(
            caches.keys().then((keys) => {
                return Promise.all(
                    keys
                        .filter((key) => key !== staticCacheName)
                        .map((key) => caches.delete(key))
                );
            })
        );
    },
    load(e) {
        e.respondWith(
            caches.match(e.request).then((cacheRes) => {
                return cacheRes || fetch(e.request);
            })
        );
    },
};

//Install event
self.addEventListener("install", (e) => {
    console.log("Caching shell assets");
    cache.cache(e);
});
//Activate event
self.addEventListener("activate", (e) => {
    console.log("Checking shell assets");
    cache.check(e);
});
//Fetch event
self.addEventListener("fetch", (e) => {
	let loaded = false;
	fetch("https://api.olejka.ru/v2").then(() => {
		if (loaded) return;
		cache.cache(e);
		loaded = true;
	}).catch(e => {
		if (loaded) return;
		cache.load(e);
		loaded = true;
	})
	setTimeout(()=>{
		if (!loaded) cache.load(e);
	}, 3000)
});
