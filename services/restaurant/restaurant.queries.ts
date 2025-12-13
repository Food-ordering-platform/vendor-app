import { useMutation, useQueryClient } from '@tanstack/react-query';
import { restaurantService } from './restaurant';
import { Alert } from 'react-native';
import { CreateRestaurantPayload, UpdateRestaurantPayload } from "../../types/restaurant.types";

export const useCreateRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRestaurantPayload) => restaurantService.createRestaurant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error: any) => {
      console.log("Create Mutation Failed:", error); // [LOG]
      const msg = error.message || "Failed to create restaurant";
      Alert.alert("Error", msg);
    }
  });
};

export const useUpdateRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateRestaurantPayload) => restaurantService.updateRestaurant(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error: any) => {
      console.log("Update Mutation Failed:", error); // [LOG]
      
      // [FIX] Read from error.message directly (from our axios interceptor)
      const msg = error.message || "Failed to update profile";
      
      // Optional: Show status specific hints
      if (error.status === 403) {
         Alert.alert("Permission Denied", "You do not have permission to edit this restaurant.");
      } else {
         Alert.alert("Error", msg);
      }
    }
  });
};