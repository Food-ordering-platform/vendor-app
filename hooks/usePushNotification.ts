import { useState, useEffect, useRef } from "react";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import api from "../services/axios";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // Keep for compatibility
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true, // New required property (Pop-up)
    shouldShowList: true,
  }),
});

export const usePushNotifications = (user: any) => {
  useEffect(() => {
    if (!user) return;

    const register = async () => {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("orders", {
          name: "New Orders",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }

      if (Device.isDevice) {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== "granted") {
          alert("Failed to get push token for push notification!");
          return;
        }

        // Get Token
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ??
          Constants?.easConfig?.projectId;
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId,
        });
        const token = tokenData.data;

        // Send to Backend
        console.log("📲 Expo Push Token:", token);
        await api.post("/auth/push-token", { token });
      } else {
        console.log("Must use physical device for Push Notifications");
      }
    };

    register();
  }, [user]);
};
