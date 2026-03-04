import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { restaurantService } from "./restaurant";
import {
  CreateRestaurantPayload,
  RestaurantEarningsResponse,
  UpdateRestaurantPayload,
} from "../../types/restaurant.types";
import { toast } from "../../components/ui/Toast"; // 👈 Import Toast

export const useCreateRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRestaurantPayload) =>
      restaurantService.createRestaurant(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success("Restaurant created successfully!");
    },
    onError: (error: any) => {
      console.log("Create Mutation Failed:", error);
      toast.error(error.message || "Failed to create restaurant");
    },
  });
};

export const useUpdateRestaurant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateRestaurantPayload) =>
      restaurantService.updateRestaurant(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      toast.success("Restaurant profile updated");
    },
    onError: (error: any) => {
      const msg = error.message || "Failed to update profile";
      if (error.status === 403) {
        toast.error("Permission Denied: You cannot edit this restaurant.");
      } else {
        toast.error(msg);
      }
    },
  });
};

// ================= NEW HOOKS =================

export const useGetMenuItems = (restaurantId: string) => {
  return useQuery({
    queryKey: ["menuItems", restaurantId],
    queryFn: () => restaurantService.getMenuItems(restaurantId),
    enabled: !!restaurantId,
  });
};

export const useAddMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ restaurantId, data }: { restaurantId: string; data: any }) =>
      restaurantService.addMenuItem(restaurantId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["menuItems", variables.restaurantId],
      });
      toast.success("Menu item added successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add menu item");
    },
  });
};

export const useToggleMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) =>
      restaurantService.toggleAvailability(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
      toast.success("Item availability updated");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update status");
    },
  });
};

export const useDeleteMenuItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => restaurantService.deleteMenuItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["menuItems"] });
      toast.success("Item deleted");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete item");
    },
  });
};

// // Fetch Balance
// export const useRestaurantEarnings = (restaurantId: string) => {
//   return useQuery({
//     queryKey: ["restaurant-earnings", restaurantId],
//     queryFn: () => restaurantService.getEarnings(restaurantId),
//     enabled: !!restaurantId,
//   });
// };

// // Fetch Transactions
// export const useRestaurantTransactions = (restaurantId: string) => {
//   return useQuery({
//     queryKey: ["restaurant-transactions", restaurantId],
//     queryFn: () => restaurantService.getTransactions(restaurantId),
//     enabled: !!restaurantId,
//   });
// };

// // Request Payout
// export const useRequestPayout = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (data: { restaurantId: string; amount: number; bankDetails: any }) => 
//       restaurantService.requestPayout(data.restaurantId, data.amount, data.bankDetails),
//     onSuccess: (_, variables) => {
//       queryClient.invalidateQueries({ queryKey: ["restaurant-earnings", variables.restaurantId] });
//       queryClient.invalidateQueries({ queryKey: ["restaurant-transactions", variables.restaurantId] });
//       toast.success("Payout request submitted");
//     },
//     onError: (error: any) => {
//       toast.error(error.message || "Payout request failed");
//     }
//   });
// };