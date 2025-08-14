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
  // Safely read title/body
  let notificationTitle = payload.notification?.title || "New Notification";
  let notificationBody = payload.notification?.body || "You have a new message";

  let link = payload?.fcmOptions?.link || payload?.data?.link || "/";

  // Handle ambulance requests specifically
  if (payload.data?.type === "ambulance_request") {
    notificationTitle = "🚑 New Ambulance Request";
    notificationBody = `Pickup: ${
      payload.data.pickupAddress || "Unknown"
    }\nFare: R${payload.data.fare || "0"}`;
    link = link || "/dashboard/driver";
  }

  const notificationOptions = {
    body: notificationBody,
    icon: "/images/elohdoc.png",
    requireInteraction: true,
    data: {
      link,
      ...payload.data,
    },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle click to open the room
self.addEventListener("notificationclick", function (event) {
  event.notification.close(); // Close the notification

  const link = event.notification?.data?.link || "/";
  const requestData = event.notification?.data;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // If the app is already open, focus it
        for (const client of clientList) {
          if (client.url === link && "focus" in client) {
            // Send the data back to the client so it can set ambulanceRequest
            client.postMessage({
              type: "NOTIFICATION_CLICK",
              data: requestData,
            });
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
