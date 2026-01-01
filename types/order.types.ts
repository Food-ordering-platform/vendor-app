// 1. Matches Prisma "OrderStatus" Enum
export type OrderStatus = 
  | 'PENDING' 
  | 'PREPARING' 
  | 'OUT_FOR_DELIVERY' 
  | 'DELIVERED' 
  | 'CANCELLED';

// 2. Matches Prisma "PaymentStatus" Enum
export type PaymentStatus = 
  | 'PENDING' 
  | 'PAID' 
  | 'FAILED' 
  | 'REFUNDED';

// 3. Matches the "OrderItem" model
export interface OrderItem {
  id: string;
  orderId: string;
  menuItemName: string;
  menuItemId?: string | null;
  quantity: number;
  price: number;
}

// 4. Matches the specific "customer" select fields in OrderService.getVendorOrders
export interface OrderCustomer {
  name: string;
  phone?: string | null;
  address?: string | null;
  email?: string; // Optional, as it might not always be fetched in the list view
}

// 5. The Main Order Interface
export interface Order {
  id: string;
  reference: string;
  customerId: string;
  restaurantId: string;
  
  // Financials
  totalAmount: number;
  deliveryFee: number;
  vendorFoodTotal: number
  
  // Statuses
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  
  // Logistics
  deliveryAddress: string;
  deliveryNotes?: string | null;
  
  // Timestamps (Dates come as strings from JSON APIs)
  createdAt: string; 
  updatedAt: string;

  // Relations (Included in the API response)
  items: OrderItem[];
  customer?: OrderCustomer;

}

// 6. API Response Wrappers
export interface OrdersResponse {
  success: boolean;
  data: Order[];
}

export interface SingleOrderResponse {
  success: boolean;
  data: Order;
}

// 7. Payload for Updating Status
export interface UpdateOrderStatusPayload {
  orderId: string;
  status: OrderStatus;
}