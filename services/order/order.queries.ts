import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from './order';
import { Alert } from 'react-native';
import { Order, OrdersResponse, UpdateOrderStatusPayload } from '../../types/order.types'; // <--- Import

export const useGetVendorOrders = (restaurantId: string) => {
  return useQuery<OrdersResponse>({
    queryKey: ['vendorOrders', restaurantId],
    queryFn: () => orderService.getVendorOrders(restaurantId),
    enabled: !!restaurantId,
    // refetchInterval: 10000,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  // Type the mutation payload
  return useMutation({
    mutationFn: (payload: UpdateOrderStatusPayload) => 
      orderService.updateOrderStatus(payload.orderId, payload.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendorOrders'] });
    },
    onError: (error: any) => {
      Alert.alert("Error", error.message || "Failed to update status");
    }
  });
};