import api from "../axios";
import { 
  OrdersResponse, 
  SingleOrderResponse 
} from "../../types/order.types";
import { VendorEarnings } from "@/types/vendor.types";

export const VendorService = {
  // 1. Get Vendor Orders (Updated to match the backend route)
  getVendorOrders: async (restaurantId: string): Promise<OrdersResponse> => {
    const response = await api.get<OrdersResponse>(`/vendor/${restaurantId}/orders`);
    return response.data;
  },

  // 2. Earnings & Payouts
  getEarnings: async (): Promise<VendorEarnings> => {
    const response = await api.get<{ success: boolean; data: VendorEarnings }>(`/vendor/earnings`);
    return response.data.data;
  },

  requestPayout: async (data: { amount: number; bankDetails: any }) => {
    const response = await api.post(`/vendor/payout`, data);
    return response.data;
  },

  // ==========================================
  // 🚀 EXPLICIT ORDER ACTIONS
  // ==========================================

  acceptOrder: async (orderId: string): Promise<SingleOrderResponse> => {
    const response = await api.patch<SingleOrderResponse>(`/vendor/order/${orderId}/accept`);
    return response.data;
  },

  requestRider: async (orderId: string): Promise<SingleOrderResponse> => {
    const response = await api.patch<SingleOrderResponse>(`/vendor/order/${orderId}/request-rider`);
    return response.data;
  },

  cancelOrder: async (orderId: string): Promise<SingleOrderResponse> => {
    const response = await api.patch<SingleOrderResponse>(`/vendor/order/${orderId}/cancel`);
    return response.data;
  },
};

export default VendorService;