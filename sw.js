const CACHE_NAME = "work-tracker-v1";
const ASSETS = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./img/add.svg",
    "./img/delete.svg",
    "./img/edit.svg",
    "./img/export.svg",
    "./img/import.svg",
    "./img/icon.svg",
    "./img/icon-192.png",
    "./manifest.json",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);
    const cachePath = url.pathname.replace(/^\/work-tracker\//, "./");

    event.respondWith(
        caches
            .match(cachePath)
            .then((response) => response || fetch(event.request))
    );
});
