

import api from "../axios";
import {
  CreateRestaurantPayload,
  UpdateRestaurantPayload,
} from "../../types/restaurant.types";
import { Platform } from "react-native";


const createFormData = (payload: CreateRestaurantPayload) => {
  const formData = new FormData();

  // Append text fields
  formData.append("name", payload.name);
  formData.append("address", payload.address);
  formData.append("phone", payload.phone);
  formData.append("email", payload.email);
  formData.append("prepTime", String(payload.prepTime));
  formData.append("isOpen", String(payload.isOpen));

  // [CRITICAL FIX] Image Handling
  if (payload.imageUri) {
    // 1. Android NEEDS 'file://' prefix. iOS sometimes prefers it removed, 
    // but expo-image-picker usually returns it correctly.
    // We ensure it's there for Android if missing.
    let uri = payload.imageUri;
    if (Platform.OS === 'android' && !uri.startsWith('file://')) {
      uri = `file://${uri}`;
    }

    // 2. Extract filename and type
    const filename = uri.split("/").pop() || "upload.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    // 3. Append as an object (React Native specific format)
    // @ts-ignore
    formData.append("image", {
      uri: uri,
      name: filename,
      type: type,
    });
  }

  return formData;
};

export const restaurantService = {
  // Create Restaurant
  createRestaurant: async (data: CreateRestaurantPayload) => {
    const formData = createFormData(data);
    
    const response = await api.post('/restaurant', formData, {
      headers: {
        // [TRICKY FIX] Some Axios versions on Android NEED this header explicitly
        'Content-Type': 'multipart/form-data', 
      },
      // [CRITICAL] Prevent Axios from stringifying the FormData
      transformRequest: (data, headers) => {
        return data; // Return FormData as-is
      },
    });
    return response.data;
  },

  // Update Restaurant
  updateRestaurant: async ({ id, data }: UpdateRestaurantPayload) => {
    const formData = createFormData(data);

    // [FIX] Use POST (matching backend) + Multipart headers + transformRequest
    const response = await api.post(`/restaurant/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      transformRequest: (data, headers) => {
        return data; // Return FormData as-is
      },
    });
    return response.data;
  }
};