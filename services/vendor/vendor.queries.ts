import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VendorService } from './vendor.service.'
import { Order, OrdersResponse, UpdateOrderStatusPayload } from '../../types/order.types';
import { toast } from '../../components/ui/Toast'; // 👈 Import Toast
import { VendorEarnings } from '@/types/vendor.types';

export const useGetVendorOrders = (restaurantId: string) => {
  return useQuery<OrdersResponse>({
    queryKey: ['vendorOrders', restaurantId],
    queryFn: () => VendorService.getVendorOrders(restaurantId),
    enabled: !!restaurantId,
    refetchInterval: 1500
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateOrderStatusPayload) => 
      VendorService.updateOrderStatus(payload.orderId, payload.status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendorOrders'] });
      const readableStatus = variables.status.replace(/_/g, " ");
      toast.success(`Order updated to ${readableStatus}`);
    },
    onError: (error: any) => {
      // 🔴 Error Toast
      toast.error(error.message || "Failed to update status");
    }
  });
};


// 3. Earnings Hook (NEW)
export const useRestaurantEarnings = (restaurantId: string) => {
  return useQuery<VendorEarnings>({
    queryKey: ['vendorEarnings', restaurantId],
    queryFn: () => VendorService.getEarnings(),
    refetchInterval: 15000, // Refresh often to see balance updates
  });
};

// 4. Transactions Hook (NEW - Reuses earnings cache)
export const useRestaurantTransactions = (restaurantId: string) => {
  return useQuery({
    queryKey: ['vendorEarnings', restaurantId], 
    queryFn: () => VendorService.getEarnings(),
    select: (data) => data.transactions
  });
};

// 5. Payout Hook (NEW)
export const useRequestPayout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { restaurantId: string; amount: number; bankDetails: any }) => 
      VendorService.requestPayout({ amount: data.amount, bankDetails: data.bankDetails }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorEarnings'] });
      toast.success("Payout request submitted");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Payout failed");
    }
  });
};
