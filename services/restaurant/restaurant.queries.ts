import { useMutation, useQueryClient } from '@tanstack/react-query';
import { restaurantService } from './restaurant';
import { Alert } from 'react-native';
import { CreateRestaurantPayload, UpdateRestaurantPayload } from "../../types/restaurant.types";

export const useCreateRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRestaurantPayload) => restaurantService.createRestaurant(data),
    onSuccess: () => {
      // Refresh user data so the new restaurant appears in the context immediately
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error.message || "Failed to create restaurant";
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
      const msg = error?.response?.data?.message || error.message || "Failed to update profile";
      Alert.alert("Error", msg);
    }
  });
};