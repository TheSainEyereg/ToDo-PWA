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
		//console.log(1);
        e.waitUntil(
            caches.open(staticCacheName).then((cache) => {
				//console.log(1.1)
                cache.addAll(assets);
            })
        );
    },
    check(e) {
		//console.log(2);
        e.waitUntil(
            caches.keys().then((keys) => {
				//console.log(2.1);
                return Promise.all(
                    keys
                        .filter((key) => key !== staticCacheName)
                        .map((key) => caches.delete(key))
                );
            })
        );
    },
    load(e) {
		//console.log(3);
        e.respondWith(
            caches.match(e.request).then((cacheRes) => {
				//console.log(3.1);
                return cacheRes || fetch(e.request).catch(/*() => console.log("Failed to fetch")*/);
            })
        );
    },
};

self.addEventListener("install", (e) => cache.cache(e));
self.addEventListener("activate", (e) => cache.check(e));

self.addEventListener("fetch", (e) => {

	if (navigator.onLine) {	
		//console.log("Connection is available!");
		cache.cache(e);
	} else {
		//console.log("No connection at all!");
		cache.load(e);
	}

	// r/therewasanattempt

	// let loaded = false;
    // const controller = new AbortController();

	// fetch("https://api.olejka.ru/v2", {
	// 	method: "GET",
	// 	mode: "no-cors",
	// 	signal: controller.signal,
	// }).then(() => {
	// 	if (loaded) return;
	// 	loaded = true;

	// 	//console.log("Connection established, caching assets!");
	// 	cache.cache(e);

	// }).catch(err => {
	// 	if (loaded) return;
	// 	loaded = true;

	// 	//console.log("Connection error, loading from cache!");
	// 	//cache.load(e);

	// })
	// setTimeout(()=>{
	// 	//console.log(loaded)
	// 	if (loaded) return;
	// 	loaded = true;

	// 	//console.log("Timed out, aborting and loading from cache!");
	// 	controller.abort();
	// 	cache.load(e);

	// }, 3000)
});
