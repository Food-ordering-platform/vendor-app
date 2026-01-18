const CACHE_NAME = 'choweazy-vendor-v1';
const OFFLINE_URL = '/';

// 1. INSTALL: Cache offline page
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([OFFLINE_URL]);
    })
  );
});

// 2. ACTIVATE: Claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 3. FETCH: Serve offline page if network fails
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
  }
});

// 4. PUSH LISTENER: Handles background notifications
self.addEventListener('push', function(event) {
  if (!(self.Notification && self.Notification.permission === 'granted')) {
    return;
  }

  const data = event.data ? event.data.json() : {};
  const title = data.title || "New Order! 🥘";
  const message = data.body || "You have a new order waiting.";
  const icon = '/vendor_logo.png'; 

  const options = {
    body: message,
    icon: icon,
    badge: icon,
    vibrate: [200, 100, 200, 100, 200],
    tag: 'new-order', 
    renotify: true,
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

// 🟢 5. NOTIFICATION CLICK (Fixed: Added 'self.')
self.addEventListener('notificationclick', function(event) {
  event.notification.close(); 

  event.waitUntil(
    // 🟢 Fix: Use 'self.clients' instead of just 'clients'
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // 1. If app is already open, focus it
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // 2. If app is closed, open a new window
      if (self.clients.openWindow) { // 🟢 Fix: Use 'self.clients' here too
        return self.clients.openWindow('/');
      }
    })
  );
});