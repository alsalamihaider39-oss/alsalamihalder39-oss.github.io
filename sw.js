/* =====================================================================
   Service Worker — مركز كربلاء لتكنولوجيا المعلومات
   يخزّن ملفات الموقع الأساسية ليعمل بسرعة وحتى بدون إنترنت.
   عند أي تحديث للموقع غيّر رقم النسخة بالأسفل.
===================================================================== */

const CACHE_NAME = "kcit-v62";

const CORE_ASSETS = [
    "./",
    "./index.html",
    "./style.css",
    "./script.js",
    "./kb.js",
    "./assistant.js",
    "./manifest.json",
    "./offline.html",
    "./offline.css",
    "./offline.js",
    "./images/logo.png"
];

self.addEventListener("install", function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) { return cache.addAll(CORE_ASSETS); })
            .catch(function () { /* تجاهل أي ملف غير موجود */ })
    );
});

/* تفعيل النسخة الجديدة عند ضغط المستخدم على «تحديث الآن» */
self.addEventListener("message", function (event) {
    if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(
                keys.filter(function (k) { return k !== CACHE_NAME; })
                    .map(function (k) { return caches.delete(k); })
            );
        }).then(function () { return self.clients.claim(); })
    );
});

self.addEventListener("fetch", function (event) {

    const request = event.request;

    if (request.method !== "GET" || !request.url.startsWith(self.location.origin)) return;

    /* الصفحات: الشبكة أولاً ثم الكاش */
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then(function (response) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(function (c) { c.put(request, copy); });
                    return response;
                })
                .catch(function () {
                    return caches.match(request)
                        .then(function (c) { return c || caches.match("./index.html"); })
                        .then(function (c) { return c || caches.match("./offline.html"); });
                })
        );
        return;
    }

    /* ملفات الكود (JS/CSS): الشبكة أولاً حتى تصل التحديثات فوراً */
    if (request.destination === "script" || request.destination === "style") {
        event.respondWith(
            fetch(request)
                .then(function (response) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(function (c) { c.put(request, copy); });
                    return response;
                })
                .catch(function () { return caches.match(request); })
        );
        return;
    }

    /* الصور: تُعرض من الكاش فوراً ثم تُحدَّث من الشبكة في الخلفية
       (stale-while-revalidate) — فأي صورة تبدّلها تظهر بعد تحديث واحد */
    if (request.destination === "image") {
        event.respondWith(
            caches.open(CACHE_NAME).then(function (cache) {
                return cache.match(request).then(function (cached) {

                    const network = fetch(request)
                        .then(function (response) {
                            if (response && response.status === 200) {
                                cache.put(request, response.clone());
                            }
                            return response;
                        })
                        .catch(function () { return cached; });

                    return cached || network;
                });
            })
        );
        return;
    }

    /* بقية الملفات: الكاش أولاً ثم الشبكة */
    event.respondWith(
        caches.match(request).then(function (cached) {
            return cached || fetch(request).then(function (response) {
                const copy = response.clone();
                caches.open(CACHE_NAME).then(function (c) { c.put(request, copy); });
                return response;
            });
        }).catch(function () { return caches.match("./offline.html"); })
    );
});