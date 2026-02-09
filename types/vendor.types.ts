
// 1. Matches Prisma "OrderStatus" Enum
export type OrderStatus = 
  | 'PENDING' 
  | 'PREPARING' 
  | 'READY_FOR_PICKUP'
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
  riderName:string
  riderPhone:string
  
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


export interface VendorOrder {
  id: string;
  reference: string;
  status: string;
  totalAmount: number;
  deliveryFee: number;
  vendorFoodTotal?: number;
  createdAt: string;
  items: any[];
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  rider?: {
    name: string;
    phone: string;
  };
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  description: string;
  createdAt: string;
}

export interface VendorEarnings {
  availableBalance: number;
  pendingBalance: number;
  totalEarnings: number;
  withdrawn: number;
  transactions: Transaction[];
}

export interface PayoutPayload {
  amount: number;
  bankDetails: {
    bankName: string; // Used for UI display
    bankCode: string; // Required by Backend/Paystack (e.g. "058")
    accountNumber: string;
    accountName: string;
  };
}