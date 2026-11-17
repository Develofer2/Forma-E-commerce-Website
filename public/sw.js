/* Versioned, bounded caches. Private APIs and all order submissions are network-only. */
const VERSION = "forma-v2"
const SHELL = `${VERSION}-shell`
const ASSETS = `${VERSION}-assets`
const IMAGES = `${VERSION}-images`
const CATALOG = `${VERSION}-catalog`
const SHELL_ROUTES = [
  "/",
  "/wishlist",
  "/checkout",
  "/account",
  "/about",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) =>
        Promise.allSettled(SHELL_ROUTES.map((path) => cache.add(path))),
      )
      .then(() => self.skipWaiting()),
  )
})
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) => key.startsWith("forma-") && !key.startsWith(VERSION),
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})
async function putBounded(name, request, response, limit) {
  if (!response.ok && response.type !== "opaque") return
  const cache = await caches.open(name)
  await cache.put(request, response)
  const keys = await cache.keys()
  await Promise.all(
    keys
      .slice(0, Math.max(0, keys.length - limit))
      .map((key) => cache.delete(key)),
  )
}
self.addEventListener("fetch", (event) => {
  const request = event.request
  if (request.method !== "GET") return
  const url = new URL(request.url)
  if (
    url.origin === self.location.origin &&
    (url.pathname.startsWith("/api/shop/") || url.pathname.startsWith("/admin"))
  )
    return
  if (
    request.mode === "navigate" ||
    (url.origin === self.location.origin &&
      request.headers.get("accept") === "text/html")
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok)
            event.waitUntil(putBounded(SHELL, request, response.clone(), 40))
          return response
        })
        .catch(async () => {
          const cache = await caches.open(SHELL)
          return (
            (await cache.match(request, { ignoreVary: true })) ||
            (await cache.match("/", { ignoreVary: true })) ||
            new Response(
              "You’re offline. Please reconnect once to load Forma.",
              { status: 503, headers: { "Content-Type": "text/plain" } },
            )
          )
        }),
    )
    return
  }
  if (
    url.origin === self.location.origin &&
    url.pathname.startsWith("/api/products")
  ) {
    const fresh = fetch(request).then((response) => {
      event.waitUntil(putBounded(CATALOG, request, response.clone(), 30))
      return response
    })
    event.respondWith(caches.match(request).then((cached) => cached || fresh))
    event.waitUntil(fresh.catch(() => {}))
    return
  }
  if (request.destination === "image") {
    event.respondWith(caches.match(request, { ignoreVary: true }).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            event.waitUntil(putBounded(IMAGES, request, response.clone(), 64))
            return response
          }),
      ))
    return
  }
  if (
    request.destination === "font" ||
    (url.origin === self.location.origin &&
      url.pathname.startsWith("/_next/static/"))
  ) {
    // These files are content-addressed or fixed font files, never user/theme-specific.
    // Ignore client-hint Vary headers so precached assets match real stylesheet/script requests.
    event.respondWith(caches.match(request, { ignoreVary: true }).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            event.waitUntil(putBounded(ASSETS, request, response.clone(), 150))
            return response
          }),
      ))
  }
})
self.addEventListener("message", (event) => {
  if (event.data?.type !== "CACHE_RESOURCES" || !Array.isArray(event.data.urls))
    return
  event.waitUntil(
    Promise.allSettled(
      event.data.urls
        .slice(0, 100)
        .filter((url) => {
          const parsed = new URL(url, self.location.origin)
          return (
            parsed.origin === self.location.origin &&
            (parsed.pathname.startsWith("/_next/static/") ||
              parsed.pathname.startsWith("/fonts/"))
          )
        })
        .map((url) =>
          fetch(url).then((response) => putBounded(ASSETS, url, response, 150)),
        ),
    ),
  )
})

function openOutbox() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("forma-offline", 10)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
self.addEventListener("sync", (event) => {
  if (event.tag !== "forma-orders") return
  event.waitUntil(
    (async () => {
      const database = await openOutbox()
      if (!database.objectStoreNames.contains("outbox")) return
      const pending = await new Promise((resolve, reject) => {
        const request = database
          .transaction("outbox")
          .objectStore("outbox")
          .getAll()
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })
      const session = await fetch("/api/shop/auth", {
        credentials: "same-origin",
        cache: "no-store",
      }).then((r) => r.json())
      for (const order of pending) {
        if (!session.user || session.user.id !== order.ownerId) continue
        const response = await fetch("/api/shop/orders", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(order),
        })
        const result = await response.json()
        if (response.ok) {
          await new Promise((resolve, reject) => {
            const transaction = database.transaction("outbox", "readwrite")
            transaction.objectStore("outbox").delete(order.idempotencyKey)
            transaction.oncomplete = resolve
            transaction.onerror = () => reject(transaction.error)
          })
        } else if (response.status >= 500)
          throw new Error("Order sync will retry later.")
        else {
          await new Promise((resolve, reject) => {
            const transaction = database.transaction("outbox", "readwrite")
            transaction
              .objectStore("outbox")
              .put({ ...order, error: result.error })
            transaction.oncomplete = resolve
            transaction.onerror = () => reject(transaction.error)
          })
        }
      }
      database.close()
    })(),
  )
})
