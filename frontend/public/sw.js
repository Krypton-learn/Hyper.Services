self.addEventListener('push', function(event) {
  event.waitUntil(
    self.registration.showNotification('HyperRevise', {
      body: event.data ? event.data.text() : 'New notification',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
    })
  )
})

self.addEventListener('notificationclick', function(event) {
  event.waitUntil(
    clients.openWindow('/')
  )
})