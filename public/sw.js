//
const CACHE_NAME = 'choweazy-vendor-v1';
const OFFLINE_URL = '/';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([OFFLINE_URL]);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
  }
});

self.addEventListener('push', function(event) {
  if (!(self.Notification && self.Notification.permission === 'granted')) {
    return;
  }

  const data = event.data ? event.data.json() : {};
  const title = data.title || "New Order! 🔔";
  const message = data.body || "Open app to accept order.";
  const icon = '/vendor_logo.png'; 

  const options = {
    body: message,
    icon: icon,
    badge: icon,
    // Aggressive vibration: 500ms vibrate, 200ms pause, repeat
    vibrate: [500, 200, 500, 200, 500, 200, 1000], 
    tag: 'new-order', 
    renotify: true, // Vibrate again even if notification is already showing
    requireInteraction: true, // Keeps notification on screen until user clicks it
    data: {
      url: '/' 
    },
    actions: [
      { action: 'view', title: 'View Order' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close(); 

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});