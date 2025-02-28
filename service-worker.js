const CACHE_NAME = "work-tracker-v1";
const assetsToCache = [
    "/",
    "/index.html",
    "/style.css",
    "/script.js",
    "/manifest.json",
    "/img/add.svg",
    "/img/delete.svg",
    "/img/edit.svg",
    "/img/export.svg",
    "/img/import.svg",
    "/img/icon-192.png",
    "/img/icon.svg",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(assetsToCache))
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches
            .match(event.request)
            .then((response) => response || fetch(event.request))
    );
});
