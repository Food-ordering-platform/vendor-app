// food-ordering-platform/vendor-app/vendor-app-work-branch/hooks/usePushNotification.ts

import { useEffect } from "react";
import { Platform } from "react-native";
import { useSubscribeToWebPush } from "../services/auth/auth.queries"; //
import * as Notifications from "expo-notifications"; //
import * as Device from "expo-device"; //
import Constants from "expo-constants"; //
import api from "../services/axios"; //

// 🟢 PASTE YOUR VAPID PUBLIC KEY HERE (from backend terminal output)
const VAPID_PUBLIC_KEY = process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY

export const usePushNotifications = (user: any) => {
  const { mutate: subscribeToWebPush } = useSubscribeToWebPush();

  useEffect(() => {
    if (!user) return;

    const registerPush = async () => {
      // ===========================
      // 🟢 1. PWA (WEB) LOGIC
      // ===========================
      if (Platform.OS === 'web') {
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.log("❌ Push notifications not supported on this browser");
            return;
        }

        try {
          // A. Ask for Permission
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') {
            console.log("❌ Notification permission denied");
            return;
          }

          // B. Get Service Worker
          const registration = await navigator.serviceWorker.ready;

          // C. Subscribe
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: VAPID_PUBLIC_KEY
          });

          // D. Send to Backend
          const subJson = subscription.toJSON();
          if(subJson.endpoint && subJson.keys) {
             subscribeToWebPush({
               endpoint: subJson.endpoint,
               keys: {
                 p256dh: subJson.keys.p256dh,
                 auth: subJson.keys.auth
               }
             });
             console.log("✅ Web Push Subscribed!");
          }
        } catch (error) {
          console.error("❌ Web Push Error:", error);
        }
        return; 
      }

      // ===========================
      // 🟢 2. NATIVE (IOS/ANDROID) LOGIC
      // ===========================
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== "granted") return;

        try {
          const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
          const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
          
          // Send Native Token (Legacy)
          await api.post("/auth/push-token", { token: tokenData.data });
        } catch (e) {
          console.log("Error getting native token:", e);
        }
      }
    };

    registerPush();
  }, [user]);
};