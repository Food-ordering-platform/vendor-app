import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { restaurantService } from './restaurant';
import { Alert } from 'react-native';
import { CreateRestaurantPayload, RestaurantEarningsResponse, TransactionResponse, UpdateRestaurantPayload } from "../../types/restaurant.types";

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

// ================= NEW HOOKS =================

// 1. Hook to Fetch Menu Items
export const useGetMenuItems = (restaurantId: string) => {
  return useQuery({
    queryKey: ['menuItems', restaurantId], // Unique key per restaurant
    queryFn: () => restaurantService.getMenuItems(restaurantId),
    enabled: !!restaurantId, // Only run query if we have an ID
  });
};

// 2. Hook to Add Menu Item
export const useAddMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // We expect an object containing both the ID and the data
    mutationFn: ({ restaurantId, data }: { restaurantId: string; data: any }) => 
      restaurantService.addMenuItem(restaurantId, data),
      
    onSuccess: (_, variables) => {
      // ✅ This is the magic part: It forces the 'MenuScreen' to re-fetch the list immediately
      queryClient.invalidateQueries({ queryKey: ['menuItems', variables.restaurantId] });
      // We can handle navigation in the component, or show success here
    },
    onError: (error: any) => {
      const msg = error.message || "Failed to add menu item";
      Alert.alert("Error", msg);
    }
  });
};

export const useToggleMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => restaurantService.toggleAvailability(itemId),
    onSuccess: (_, itemId) => {
      // Invalidate queries to refresh the list automatically
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to update status");
    }
  });
};

export const useDeleteMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => restaurantService.deleteMenuItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menuItems'] });
      Alert.alert("Success", "Item deleted successfully");
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to delete item");
    }
  });
};

export const useGetEarnings = (restaurantId: string) => {
  return useQuery<RestaurantEarningsResponse>({
    queryKey:['earnings', restaurantId],
    queryFn: () => restaurantService.getEarnings(restaurantId),
    enabled: !!restaurantId
  })
}

export const useGetTransactions = (restaurantId: string) => {
  return useQuery<TransactionResponse>({ // 👈 Add the generic type here
    queryKey: ["transactions", restaurantId],
    queryFn: () => restaurantService.getTransactions(restaurantId),
    enabled: !!restaurantId, 
  });
};