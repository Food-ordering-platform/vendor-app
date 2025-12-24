import api from "../axios";
import { 
  Order, 
  OrdersResponse, 
  OrderStatus, 
  SingleOrderResponse 
} from "../../types/order.types";

export const orderService = {
  // 1. Get Vendor Orders (Uses the Response Type)
  getVendorOrders: async (restaurantId: string): Promise<OrdersResponse> => {
    const response = await api.get<OrdersResponse>(`/orders/restaurant/${restaurantId}`);
    return response.data;
  },

  // 2. Update Status (Uses Strict 'OrderStatus' Type)
  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<SingleOrderResponse> => {
    // We still just send { status } - Backend handles the email logic!
    const response = await api.patch<SingleOrderResponse>(`/orders/${orderId}/status`, { status });
    return response.data;
  },
  
  // 3. (Optional) Get Single Order details
  getSingleOrder: async (orderId: string): Promise<SingleOrderResponse> => {
    const response = await api.get<SingleOrderResponse>(`/orders/single/${orderId}`);
    return response.data;
  }
};