importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Replace these with your actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyDNveel7W-ihnUJ271cUKgIWCdmu6otrXE",
  authDomain: "mygatebell.firebaseapp.com",
  projectId: "mygatebell",
  storageBucket: "mygatebell.firebasestorage.app",
  messagingSenderId: "1076167782513",
  appId: "1:1076167782513:web:227fe3547e66894c812bd0",
  measurementId: "G-Z342GWZGRY"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body,
    icon: '/vite.svg',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
