import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from './order';
import { Order, OrdersResponse, UpdateOrderStatusPayload } from '../../types/order.types';
import { toast } from '../../components/ui/Toast'; // 👈 Import Toast

export const useGetVendorOrders = (restaurantId: string) => {
  return useQuery<OrdersResponse>({
    queryKey: ['vendorOrders', restaurantId],
    queryFn: () => orderService.getVendorOrders(restaurantId),
    enabled: !!restaurantId,
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateOrderStatusPayload) => 
      orderService.updateOrderStatus(payload.orderId, payload.status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendorOrders'] });
      // 🟢 Add Toast Feedback
      const readableStatus = variables.status.replace(/_/g, " ");
      toast.success(`Order updated to ${readableStatus}`);
    },
    onError: (error: any) => {
      // 🔴 Error Toast
      toast.error(error.message || "Failed to update status");
    }
  });
};