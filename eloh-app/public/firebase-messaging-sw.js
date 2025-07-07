importScripts(
  "https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js"
);

// Initialize the Firebase app in the service worker by passing in your config
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

// Optional: customize background notification handling
messaging.onBackgroundMessage(function (payload) {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
