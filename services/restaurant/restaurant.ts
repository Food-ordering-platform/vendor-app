import api from "../axios";
import {
  CreateRestaurantPayload,
  RestaurantEarningsResponse,
  UpdateRestaurantPayload,
} from "../../types/restaurant.types";
import { Platform } from "react-native";

// --- Helper 1: For Restaurant Profile (EXISTING) ---
const createFormData = (payload: CreateRestaurantPayload) => {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("address", payload.address);
  formData.append("phone", payload.phone);
  formData.append("email", payload.email);
  formData.append("prepTime", String(payload.prepTime));
  formData.append("isOpen", String(payload.isOpen));

  // 👇 ADDED: Append Coordinates
  if (payload.latitude) formData.append("latitude", String(payload.latitude));
  if (payload.longitude) formData.append("longitude", String(payload.longitude));

  if (payload.imageUri) {
    const filename = payload.imageUri.split("/").pop();
    const match = /\.(\w+)$/.exec(filename || "");
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    // @ts-ignore: React Native FormData
    formData.append("image", {
      uri:
        Platform.OS === "android"
          ? payload.imageUri
          : payload.imageUri.replace("file://", ""),
      name: filename || "upload.jpg",
      type,
    });
  }
  return formData;
};

// --- Helper 2: For Menu Items (NEW - REQUIRED) ---
const createMenuFormData = (payload: any) => {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("description", payload.description);
  formData.append("price", String(payload.price));
  formData.append("categoryName", payload.categoryName);

  if (payload.imageUri) {
    const filename = payload.imageUri.split("/").pop();
    const match = /\.(\w+)$/.exec(filename || "");
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    // @ts-ignore
    formData.append("image", {
      uri:
        Platform.OS === "android"
          ? payload.imageUri
          : payload.imageUri.replace("file://", ""),
      name: filename || "food-item.jpg",
      type,
    });
  }
  return formData;
};

export const restaurantService = {
  // 1. Create Restaurant
  createRestaurant: async (data: CreateRestaurantPayload) => {
    const formData = createFormData(data);
    const response = await api.post("/restaurant", formData, {
      headers: { Accept: "application/json" },
      transformRequest: (data) => data,
    });
    return response.data;
  },

  // 2. Update Restaurant
  updateRestaurant: async ({ id, data }: UpdateRestaurantPayload) => {
    const formData = createFormData(data);
    const response = await api.post(`/restaurant/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      transformRequest: (data) => data,
    });
    return response.data;
  },

  // 3. Get Menu Items
  getMenuItems: async (restaurantId: string) => {
    const response = await api.get(`/restaurant/${restaurantId}/menu`);
    return response.data;
  },

  // 4. Add Menu Item (Ensure this has transformRequest!)
  addMenuItem: async (
    restaurantId: string,
    data: {
      name: string;
      description: string;
      price: string;
      categoryName: string;
      imageUri: string | null;
    }
  ) => {
    // ⚠️ MUST use the new helper
    const formData = createMenuFormData(data);

    const response = await api.post(
      `/restaurant/${restaurantId}/menu`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // ⚠️ This is CRITICAL for FormData to work
        transformRequest: (data) => data,
      }
    );
    return response.data;
  },

  //Toggle Menu items Availability
  toggleAvailability: async (itemId: string) => {
    //Match Backend route:
    const response = await api.patch(`/restaurant/menu/${itemId}/toggle`);
    return response.data;
  },

  //Delete Menu Item
  deleteMenuItem: async (itemId: string) => {
    const response = await api.delete(`/restaurant/menu/${itemId}`);
    return response.data;
  },

  //getEarnings
  getEarnings: async (
    restaurantId: string
  ): Promise<RestaurantEarningsResponse> => {
    const response = await api.get<RestaurantEarningsResponse>(
      `/restaurant/${restaurantId}/earnings`
    );
    return response.data;
  },

  getTransactions: async(restaurantId: string) => {
    const response = await api.get(`/restaurant/${restaurantId}/transactions`)
    return response.data
  }
};
