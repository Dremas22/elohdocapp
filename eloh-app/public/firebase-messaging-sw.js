importScripts(
  "https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyCJ-x8rCIOsVpAdFqhFn1fIW5Bh0FyeVto",
  authDomain: "elohdoc.firebaseapp.com",
  projectId: "elohdoc",
  storageBucket: "elohdoc.firebasestorage.app",
  messagingSenderId: "964235613183",
  appId: "1:964235613183:web:913aba164e73bcc1f20dca",
  measurementId: "G-T6N8P20CF8",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  const notificationTitle = payload.notification.title;
  const notificationBody = payload.notification.body;

  const link = payload?.fcmOptions?.link || payload?.data?.link || "/";

  const notificationOptions = {
    body: notificationBody,
    icon: "/images/elohdoc.png",
    requireInteraction: true,
    data: {
      link: link,
    },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle click to open the room
self.addEventListener("notificationclick", function (event) {
  event.notification.close(); // Close the notification

  const link = event.notification?.data?.link || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If the app is already open, focus it
        for (const client of clientList) {
          if (client.url === link && "focus" in client) {
            return client.focus();
          }
        }

        // If not, open a new window
        if (clients.openWindow) {
          return clients.openWindow(link);
        }
      })
  );
});
