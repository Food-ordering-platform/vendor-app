import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VendorService } from './vendor.service';
import { OrdersResponse } from '../../types/order.types';
import { toast } from '../../components/ui/Toast'; 
import { VendorEarnings } from '@/types/vendor.types';

export const useGetVendorOrders = (restaurantId: string) => {
  return useQuery<OrdersResponse>({
    queryKey: ['vendorOrders', restaurantId],
    queryFn: () => VendorService.getVendorOrders(restaurantId),
    enabled: !!restaurantId,
    refetchInterval: 1500
  });
};

export const useVendorEarnings = (restaurantId: string) => {
  return useQuery<VendorEarnings>({
    queryKey: ['vendorEarnings', restaurantId],
    queryFn: () => VendorService.getEarnings(),
    refetchInterval: 15000, 
  });
};

export const useVendorTransactions = (restaurantId: string) => {
  return useQuery({
    queryKey: ['vendorEarnings', restaurantId],
    queryFn: () => VendorService.getEarnings(),
    select: (data) => data.transactions
  });
};

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

// ==========================================
// 🚀 EXPLICIT ORDER ACTION MUTATIONS
// ==========================================

export const useAcceptOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => VendorService.acceptOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorOrders'] });
      toast.success("Order accepted! You can start preparing.");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to accept order");
    }
  });
};

export const useRequestRider = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => VendorService.requestRider(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorOrders'] });
      // 💸 Invalidate earnings because money moves from pending -> available!
      queryClient.invalidateQueries({ queryKey: ['vendorEarnings'] });
      toast.success("Food ready! Rider requested and earnings secured.");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to request rider");
    }
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => VendorService.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorOrders'] });
      toast.success("Order cancelled successfully.");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to cancel order");
    }
  });
};