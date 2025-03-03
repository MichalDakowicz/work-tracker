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

self.addEventListener("fetch", (event) => {
    event.respondWith(fetch(event.request));
});
