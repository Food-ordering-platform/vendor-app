import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native"; // 👈 Import Platform

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!BASE_URL) {
  console.error("❌ Missing API URL! Check your .env file");
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Accept": "application/json",
  },
  timeout: 60000, 
});

// Add Token to requests
api.interceptors.request.use(
  async (config) => {
    console.log(`🚀 Requesting: ${config.baseURL}${config.url}`);
    
    let token;
    
    // Check Platform to decide storage method
    if (Platform.OS === 'web') {
      token = localStorage.getItem("auth_token");
    } else {
      token = await SecureStore.getItemAsync("auth_token");
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle Responses & Errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error("❌ API Error:", error.response.status, error.response.data);
      const message = error.response.data.message || error.response.data.error || "Something went wrong";
      return Promise.reject({ message, status: error.response.status });
    } else if (error.request) {
      console.error("❌ Network Error:", error.message);
      return Promise.reject({ message: "Network Error. Check internet or server status." });
    } else {
      console.error("❌ Unknown Error:", error.message);
      return Promise.reject({ message: "An unexpected error occurred." });
    }
  }
);

export default api;