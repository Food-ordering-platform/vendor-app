//
const CACHE_NAME = 'choweazy-vendor-v1';
const OFFLINE_URL = '/';

// 1. INSTALL
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([OFFLINE_URL]);
    })
  );
});

// 2. ACTIVATE
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 3. FETCH
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
  }
});

// 4. PUSH LISTENER
self.addEventListener('push', function(event) {
  if (!(self.Notification && self.Notification.permission === 'granted')) {
    return;
  }

  const data = event.data ? event.data.json() : {};
  const title = data.title || "New Order! 🥘";
  const message = data.body || "Open app to accept order.";
  const icon = '/vendor_logo.png'; 

  // ⚡ GENERATE 1-MINUTE VIBRATION PATTERN
  // 500ms Vibrate + 300ms Pause = 800ms per cycle
  // 60,000ms / 800ms = 75 cycles
  const oneMinuteVibration = [];
  for (let i = 0; i < 75; i++) {
    oneMinuteVibration.push(500); // Vibrate
    oneMinuteVibration.push(300); // Pause
  }

  const options = {
    body: message,
    icon: icon,
    badge: icon,
    vibrate: oneMinuteVibration, // Use the generated 60s pattern
    tag: 'new-order', 
    renotify: true, // Vibrate again if a new order comes
    requireInteraction: true, // Keep notification visible
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

// 5. NOTIFICATION CLICK
self.addEventListener('notificationclick', function(event) {
  event.notification.close(); 

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // 1. Focus existing tab
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // 2. Or open new one
      if (self.clients.openWindow) {
        return self.clients.openWindow('/');
      }
    })
  );
});