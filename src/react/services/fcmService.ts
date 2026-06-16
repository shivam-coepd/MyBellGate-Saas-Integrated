import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  MessagePayload,
} from "firebase/messaging";
import apiClient from "./api";

// Replace these with your actual Firebase project config for the web portal
const firebaseConfig = {
  apiKey: "AIzaSyDNveel7W-ihnUJ271cUKgIWCdmu6otrXE",
  authDomain: "mygatebell.firebaseapp.com",
  projectId: "mygatebell",
  storageBucket: "mygatebell.firebasestorage.app",
  messagingSenderId: "1076167782513",
  appId: "1:1076167782513:web:227fe3547e66894c812bd0",
  measurementId: "G-Z342GWZGRY",
};

let messaging: any = null;

try {
  const app = initializeApp(firebaseConfig);
  messaging = getMessaging(app);
} catch (error) {
  console.error("Firebase App Initialization Error:", error);
}

export const requestFirebasePermission = async () => {
  if (!messaging) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey:
          "BLc9ALyz4XD_IxczltXp8as_NYPwzTOdPApAKib7EAE64WlrsxcbpuGawRgdWsN6Sy7Lg7VAa-1jNpno_9oH7ek",
      });
      if (token) {
        console.log("Firebase Web Push Token:", token);
        // Send token to backend
        try {
          await apiClient.registerWebPushToken(token);
        } catch (e) {
          console.error("Failed to register web push token with backend", e);
        }
        return token;
      }
    }
  } catch (error) {
    console.error("Error getting notification permission or token", error);
  }
  return null;
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (messaging) {
      onMessage(messaging, (payload: MessagePayload) => {
        resolve(payload);
      });
    }
  });
