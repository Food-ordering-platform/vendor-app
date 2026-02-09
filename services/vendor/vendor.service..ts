import api from "../axios";
import { 
  Order, 
  OrdersResponse, 
  OrderStatus, 
  SingleOrderResponse 
} from "../../types/order.types";
import { VendorEarnings } from "@/types/vendor.types";

export const VendorService = {
  // 1. Get Vendor Orders (Uses the Response Type)
  getVendorOrders: async (restaurantId: string): Promise<OrdersResponse> => {
    const response = await api.get<OrdersResponse>(`/vendor/restaurant/${restaurantId}`);
    return response.data;
  },

  // 2. Update Status (Uses Strict 'OrderStatus' Type)
  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<SingleOrderResponse> => {
    // We still just send { status } - Backend handles the email logic!
    const response = await api.patch<SingleOrderResponse>(`/vendor/${orderId}/status`, { status });
    return response.data;
  },

  // 1. Get Earnings
  getEarnings: async (): Promise<VendorEarnings> => {
    const response = await api.get<{ success: boolean; data: VendorEarnings }>(`/vendor/earnings`);
    return response.data.data;
  },

  // 2. Request Payout
  requestPayout: async (data: { amount: number; bankDetails: any }) => {
    // Ensure you are sending the bankCode if backend requires it
    // For this example, we assume bankDetails has { bankCode: "058", accountNumber: "..." }
    const response = await api.post(`/vendor/payout`, data);
    return response.data;
}
}

export default VendorService
