import api from "../axios";
import {
  CreateRestaurantPayload,
  UpdateRestaurantPayload,
} from "../../types/restaurant.types";
import { Platform } from "react-native";

const createFormData = (payload: CreateRestaurantPayload) => {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("address", payload.address);
  formData.append("phone", payload.phone);
  formData.append("email", payload.email);
  formData.append("prepTime", String(payload.prepTime));
  formData.append("isOpen", String(payload.isOpen));

  if (payload.imageUri) {
    const filename = payload.imageUri.split("/").pop();
    const match = /\.(\w+)$/.exec(filename || "");
    const type = match ? `image/${match[1]}` : `image/jpeg`;

    // @ts-ignore: React Native FormData expects this structure
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

export const restaurantService = {
  //Create a new restaurant (GO live)
  createRestaurant: async (data: CreateRestaurantPayload) => {
    const formData = createFormData(data);
    // Axios auto-sets 'Content-Type: multipart/form-data' when it sees FormData
    const response = await api.post('/restaurant', formData);
    return response.data;
  },
  //Update Restaurant
 updateRestaurant: async ({ id, data }: UpdateRestaurantPayload) => {
    const formData = createFormData(data);
    const response = await api.put(`/restaurant/${id}`, formData);
    return response.data;
  }
};
