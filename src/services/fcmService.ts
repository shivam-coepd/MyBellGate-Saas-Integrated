import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import axios from "axios"; // Assuming axios is used for API requests, adjust as needed

// TODO: Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDNveel7W-ihnUJ271cUKgIWCdmu6otrXE",
  authDomain: "mygatebell.firebaseapp.com",
  projectId: "mygatebell",
  storageBucket: "mygatebell.firebasestorage.app",
  messagingSenderId: "1076167782513",
  appId: "1:1076167782513:web:227fe3547e66894c812bd0",
  measurementId: "G-Z342GWZGRY",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestFirebaseNotificationPermission = async (
  apiUrl: string,
  authToken: string,
) => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // Get the FCM token
      // TODO: Replace 'YOUR_VAPID_KEY' with your actual VAPID key
      const token = await getToken(messaging, {
        vapidKey:
          "BLc9ALyz4XD_IxczltXp8as_NYPwzTOdPApAKib7EAE64WlrsxcbpuGawRgdWsN6Sy7Lg7VAa-1jNpno_9oH7ek",
      });

      if (token) {
        console.log("FCM Token registered:", token);
        // Register token with backend
        await axios.post(
          `${apiUrl}/notifications/tokens`,
          {
            device_token: token,
            device_type: "web",
          },
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          },
        );
      } else {
        console.log(
          "No registration token available. Request permission to generate one.",
        );
      }
    } else {
      console.log("Notification permission denied");
    }
  } catch (error) {
    console.error("An error occurred while retrieving token:", error);
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
