import api from "../axios";
import {
  BankDetails,
  CreateRestaurantPayload,
  RestaurantEarnings,
  RestaurantEarningsResponse,
  Transaction,
  TransactionResponse,
  UpdateRestaurantPayload,
} from "../../types/restaurant.types";
import { Platform } from "react-native";

// --- Helper 1: For Restaurant Profile (UPDATED FOR WEB) ---
const createFormData = async (payload: CreateRestaurantPayload) => {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("address", payload.address);
  formData.append("phone", payload.phone);
  formData.append("email", payload.email);
  formData.append("prepTime", String(payload.prepTime));
  formData.append("isOpen", String(payload.isOpen));

  if (payload.latitude) formData.append("latitude", String(payload.latitude));
  if (payload.longitude) formData.append("longitude", String(payload.longitude));

  if (payload.imageUri) {
    if (Platform.OS === 'web') {
      // 🟢 WEB FIX: Convert URI to Blob
      try {
        const response = await fetch(payload.imageUri);
        const blob = await response.blob();
        formData.append("image", blob, "restaurant-cover.jpg");
      } catch (error) {
        console.error("Error converting image to blob:", error);
      }
    } else {
      // 📱 MOBILE FIX: Keep existing logic
      const filename = payload.imageUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      // @ts-ignore: React Native FormData
      formData.append("image", {
        uri: Platform.OS === "android" ? payload.imageUri : payload.imageUri.replace("file://", ""),
        name: filename || "upload.jpg",
        type,
      });
    }
  }
  return formData;
};

// --- Helper 2: For Menu Items (UPDATED FOR WEB) ---
const createMenuFormData = async (payload: any) => {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("description", payload.description);
  formData.append("price", String(payload.price));
  formData.append("categoryName", payload.categoryName);

  if (payload.imageUri) {
    if (Platform.OS === 'web') {
      // 🟢 WEB FIX
      try {
        const response = await fetch(payload.imageUri);
        const blob = await response.blob();
        formData.append("image", blob, "menu-item.jpg");
      } catch (error) {
        console.error("Error converting menu image:", error);
      }
    } else {
      // 📱 MOBILE FIX
      const filename = payload.imageUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      // @ts-ignore
      formData.append("image", {
        uri: Platform.OS === "android" ? payload.imageUri : payload.imageUri.replace("file://", ""),
        name: filename || "food-item.jpg",
        type,
      });
    }
  }
  return formData;
};

export const restaurantService = {
  // 1. Create Restaurant
  createRestaurant: async (data: CreateRestaurantPayload) => {
    // Await the async form data creation
    const formData = await createFormData(data);
    const response = await api.post("/restaurant", formData, {
      headers: { Accept: "application/json", "Content-Type":"multipart/form-data" },
      transformRequest: (data) => data,
    });
    return response.data;
  },

  // 2. Update Restaurant
  updateRestaurant: async ({ id, data }: UpdateRestaurantPayload) => {
    const formData = await createFormData(data);
    const response = await api.post(`/restaurant/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      transformRequest: (data) => data,
    });
    return response.data;
  },

  // 3. Get Menu Items
  getMenuItems: async (restaurantId: string) => {
    const response = await api.get(`/restaurant/${restaurantId}/menu`);
    return response.data;
  },

  // 4. Add Menu Item
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
    const formData = await createMenuFormData(data); // Await here too

    const response = await api.post(
      `/restaurant/${restaurantId}/menu`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        transformRequest: (data) => data,
      }
    );
    return response.data;
  },

  // 5. Toggle Availability
  toggleAvailability: async (itemId: string) => {
    const response = await api.patch(`/restaurant/menu/${itemId}/toggle`);
    return response.data;
  },

  // 6. Delete Menu Item
  deleteMenuItem: async (itemId: string) => {
    const response = await api.delete(`/restaurant/menu/${itemId}`);
    return response.data;
  },

  // ---------------- FINANCE ---------------- //

  // 7. Get Earnings
  getEarnings: async (restaurantId: string): Promise<RestaurantEarnings> => {
    const response = await api.get<RestaurantEarningsResponse>(`/restaurant/${restaurantId}/earnings`);
    return response.data.data;
  },

  // 8. Get Transactions
  getTransactions: async (restaurantId: string): Promise<Transaction[]> => {
    const response = await api.get<TransactionResponse>(`/restaurant/${restaurantId}/transactions`);
    return response.data.data;
  },

  // 9. Request Payout
  requestPayout: async (
    restaurantId: string, 
    amount: number, 
    bankDetails: BankDetails
  ) => {
    const response = await api.post(`/restaurant/${restaurantId}/payout`, {
      amount,
      bankDetails
    });
    return response.data;
  }
};