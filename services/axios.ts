import axios from "axios";
import * as SecureStore from "expo-secure-store";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if(!BASE_URL){
    throw new Error("MIssing API URL! Check your env file");
}

const api = axios.create({
    baseURL: BASE_URL,
    headers:{
        "Content-Type": "application/json",
    },
    timeout: 10000,
})

api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      return Promise.reject({ message: error.response.data.message || "Something went wrong" });
    } else if (error.request) {
      return Promise.reject({ message: "Network Error. Check your internet connection." });
    } else {
      return Promise.reject({ message: "An unexpected error occurred." });
    }
  }
);

export default api;