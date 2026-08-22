// Service worker próprio (estratégia injectManifest do vite-plugin-pwa): faz o precache do
// app shell como o generateSW faria, e soma o tratamento de push que o generateSW não oferece.
// Não é verificado pelo tsc do app (ambiente de worker, globais diferentes) — ver tsconfig.app.json.
/// <reference lib="webworker" />
import { clientsClaim } from 'workbox-core'
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope

self.skipWaiting()
clientsClaim()
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

interface PushPayload {
  title?: string
  body?: string
  url?: string
}

self.addEventListener('push', (event) => {
  let payload: PushPayload = {}
  try {
    payload = event.data?.json() ?? {}
  } catch {
    payload = { body: event.data?.text() }
  }

  const title = payload.title ?? 'Tiny Home'
  const options: NotificationOptions = {
    body: payload.body ?? '',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { url: payload.url ?? '/hoje' },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data?.url as string) ?? '/hoje'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsList) => {
      const existing = clientsList.find((c) => 'focus' in c) as WindowClient | undefined
      if (existing) {
        existing.navigate(url)
        return existing.focus()
      }
      return self.clients.openWindow(url)
    }),
  )
})
