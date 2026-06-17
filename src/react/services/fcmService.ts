import { initializeApp, getApps } from "firebase/app";
import { getMessaging, getToken, onMessage, MessagePayload } from "firebase/messaging";
import apiClient from "./api";

const firebaseConfig = {
  apiKey: "AIzaSyDNveel7W-ihnUJ271cUKgIWCdmu6otrXE",
  authDomain: "mygatebell.firebaseapp.com",
  projectId: "mygatebell",
  storageBucket: "mygatebell.firebasestorage.app",
  messagingSenderId: "1076167782513",
  appId: "1:1076167782513:web:227fe3547e66894c812bd0",
  measurementId: "G-Z342GWZGRY",
};

const VAPID_KEY =
  "BLc9ALyz4XD_IxczltXp8as_NYPwzTOdPApAKib7EAE64WlrsxcbpuGawRgdWsN6Sy7Lg7VAa-1jNpno_9oH7ek";

// Initialise once — guard against hot-reload double-init
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

/**
 * Register the Firebase service worker, request permission, obtain a push
 * token and persist it to the backend.
 *
 * Returns the FCM token on success, null on any failure.
 */
export const requestFirebasePermission = async (): Promise<string | null> => {
  // 1. Check browser support
  if (!("serviceWorker" in navigator) || !("Notification" in window)) {
    console.warn("[FCM] Service workers or Notifications not supported.");
    return null;
  }

  // 2. Request notification permission
  const permission = await Notification.requestPermission();
  console.log("[FCM] Notification permission:", permission);
  if (permission !== "granted") {
    console.warn("[FCM] Notification permission denied.");
    return null;
  }

  try {
    // 3. Register (or retrieve) the service worker explicitly so Firebase
    //    knows which SW to use for push events.
    const swRegistration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
      { scope: "/" }
    );
    console.log("[FCM] Service worker registered:", swRegistration.scope);

    // 4. Get the Messaging instance bound to the registered SW
    const messaging = getMessaging(app);

    // 5. Obtain the FCM push token
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    });

    if (!token) {
      console.warn("[FCM] getToken() returned empty — check VAPID key and Firebase project settings.");
      return null;
    }

    console.log("[FCM] Push token obtained:", token);

    // 6. Send token to our backend
    try {
      const res = await apiClient.registerWebPushToken(token);
      if (res?.success) {
        console.log("[FCM] Token registered with backend successfully.");
      } else {
        console.warn("[FCM] Backend returned failure:", res?.message);
      }
    } catch (backendErr) {
      console.error("[FCM] Failed to register token with backend:", backendErr);
    }

    return token;
  } catch (err) {
    console.error("[FCM] Error during FCM setup:", err);
    return null;
  }
};

/**
 * Listen for foreground messages. Resolves once with the first payload
 * received, then must be called again to re-arm.
 */
export const onMessageListener = (): Promise<MessagePayload> =>
  new Promise((resolve) => {
    try {
      const messaging = getMessaging(app);
      onMessage(messaging, (payload) => resolve(payload));
    } catch (err) {
      console.error("[FCM] onMessage setup failed:", err);
    }
  });
