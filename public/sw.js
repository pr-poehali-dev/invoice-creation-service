const CACHE = "sweep-v1";
const STATIC = ["/", "/src/main.tsx"];

self.addEventListener("install", e => {
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Push-уведомления
self.addEventListener("push", e => {
  const data = e.data?.json() || {};
  e.waitUntil(
    self.registration.showNotification(data.title || "Бухгалтерия", {
      body: data.body || "",
      icon: "https://cdn.poehali.dev/projects/68306774-d4e1-4aad-b342-c18426adb743/bucket/b3e1fdda-d623-45d7-8576-66d557372c36.png",
      badge: "https://cdn.poehali.dev/projects/68306774-d4e1-4aad-b342-c18426adb743/bucket/b3e1fdda-d623-45d7-8576-66d557372c36.png",
      vibrate: [200, 100, 200],
      data: data
    })
  );
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(clients.openWindow("/"));
});
