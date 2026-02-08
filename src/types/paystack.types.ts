// Paystack TypeScript type definitions for frontend

export interface StoreAllocation {
  store_id: number;
  product_amount: number; // Store's product total in kobo
  seller_amount: number; // 95% of product price goes to seller (in kobo)
  platform_fee: number; // 5% of product price goes to platform (in kobo)
  item_count?: number;
  /** @deprecated Use product_amount, seller_amount, platform_fee instead */
  amount?: number;
}

export interface SplitConfig {
  seller_percentage: number; // e.g., 95
  platform_percentage: number; // e.g., 5
  product_total: number; // Total product price in kobo
  delivery_charge: number; // Delivery charge in kobo (100% to platform)
  platform_total: number; // 5% of products + 100% delivery (in kobo)
  seller_total: number; // 95% of products (in kobo)
}

export interface PaystackInitializeRequest {
  email: string;
  amount: number; // Amount in kobo
  currency?: string;
  callback_url: string;
  reference?: string;
  store_id?: number; // For single-store split payments
  stores?: number[]; // For multi-store split payments
  store_allocations?: StoreAllocation[]; // Per-store amount breakdown
  order_id?: number; // For order tracking
  split_payment?: boolean; // Enable automatic split (5% admin, 95% seller)
  split_config?: SplitConfig; // Detailed split calculation
  metadata?: {
    cancel_url?: string;
    order_id?: string;
    customer_id?: string | number;
    stores?: number[];
    store_allocations?: StoreAllocation[];
    is_multi_seller?: boolean;
    split_breakdown?: {
      product_total: number;
      delivery_charge: number;
      seller_percentage: number;
      platform_percentage: number;
      seller_gets: number;
      platform_gets: number;
    };
    custom_fields?: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
    [key: string]: unknown;
  };
}

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    data: {
      authorization_url: string;
      access_code: string;
      reference: string;
    };
  };
}

export interface PaystackVerifyRequest {
  reference: string;
}

export interface PaystackCustomer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  customer_code: string;
  phone: string;
  metadata: Record<string, unknown> | null;
  risk_action: string;
}

export interface PaystackAuthorization {
  authorization_code: string;
  bin: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  channel: string;
  card_type: string;
  bank: string;
  country_code: string;
  brand: string;
  reusable: boolean;
  signature: string;
  account_name: string;
}

export interface PaystackVerificationData {
  id: number;
  domain: string;
  status: string;
  reference: string;
  amount: number;
  message: string;
  gateway_response: string;
  paid_at: string;
  created_at: string;
  channel: string;
  currency: string;
  ip_address: string;
  metadata: Record<string, unknown> | null;
  fees: number;
  customer: PaystackCustomer;
  authorization: PaystackAuthorization;
  plan: unknown;
}

export interface PaystackVerificationResponse {
  status: boolean;
  message: string;
  data: {
    data: PaystackVerificationData;
  };
}

export interface PaystackRefundRequest {
  transaction: string; // Transaction reference or ID
  amount?: number; // Amount in kobo (optional for full refund)
  reason?: string;
  currency?: string;
}

export interface PaystackRefundResponse {
  status: boolean;
  message: string;
  data: {
    data: {
      transaction: {
        id: number;
        domain: string;
        reference: string;
        amount: number;
        paid_at: string;
        channel: string;
        currency: string;
        authorization: Record<string, unknown> | null;
        customer: Record<string, unknown> | null;
        plan: unknown;
      };
      integration: number;
      deducted_amount: number;
      channel: string;
      merchant_note: string;
      customer_note: string;
      status: string;
      refunded_by: string;
      expected_at: string;
      currency: string;
      domain: string;
      amount: number;
      fully_deducted: boolean;
      id: number;
      createdAt: string;
      updatedAt: string;
    };
  };
}

export interface PaystackPublicKeyResponse {
  publicKey: string;
}

// Paystack state types for Redux
export interface PaystackState {
  // Payment initialization
  isInitializing: boolean;
  initializationError: string | null;
  paymentData: PaystackInitializeRequest | null;
  
  // Payment verification
  isVerifying: boolean;
  verificationError: string | null;
  verificationData: PaystackVerificationData | null;
  
  // Payment status
  paymentStatus: 'idle' | 'pending' | 'success' | 'failed' | 'cancelled';
  paymentReference: string | null;
  
  // Public key
  publicKey: string | null;
  
  // Transaction details
  currentTransaction: PaystackVerificationData | null;
  
  // Refund status
  isRefunding: boolean;
  refundError: string | null;
  refundData: unknown | null;
}

// Payment form data
export interface PaymentFormData {
  email: string;
  amount: number;
  firstName: string;
  lastName: string;
  phone?: string;
  customFields?: Array<{
    display_name: string;
    variable_name: string;
    value: string;
  }>;
}

// Payment callback data
export interface PaystackCallbackData {
  reference: string;
  trxref?: string;
  status?: string;
}

// Error types
export interface PaystackError {
  message: string;
  code?: string;
  status?: number;
  data?: unknown;
}

// Split Payment specific types
// For single-store split payments
export interface SingleStoreSplitPaymentRequest extends PaystackInitializeRequest {
  store_id: number; // Required for single-store split payments
  split_payment: true; // Always true for split payments
}

// For multi-store split payments
export interface MultiStoreSplitPaymentRequest extends PaystackInitializeRequest {
  stores: number[]; // Required for multi-store split payments
  store_allocations: StoreAllocation[]; // Amount breakdown per store
  split_payment: true; // Always true for split payments
}

// Union type for any split payment request
export type SplitPaymentRequest = SingleStoreSplitPaymentRequest | MultiStoreSplitPaymentRequest;

export interface SplitPaymentCalculation {
  total_amount: number;
  admin_amount: number;
  seller_amount: number;
  admin_percentage: number;
  seller_percentage: number;
}

// Multi-seller split calculation
export interface MultiSellerSplitCalculation {
  total_amount: number;
  admin_total: number;
  sellers: Array<{
    store_id: number;
    seller_amount: number;
    admin_amount: number;
    gross_amount: number;
  }>;
  admin_percentage: number;
  seller_percentage: number;
}

export interface PaymentSplitData {
  id: number;
  order_id: number;
  store_id: number;
  total_amount: number;
  admin_amount: number;
  seller_amount: number;
  admin_percentage: number;
  seller_percentage: number;
  split_status: 'pending' | 'completed' | 'failed';
  admin_settled: boolean;
  seller_settled: boolean;
  admin_settled_at?: string;
  seller_settled_at?: string;
  paystack_transaction_id?: string;
  created_at: string;
  updated_at: string;
}

// Store information for split payments
export interface StoreInfo {
  id: number;
  store_name: string;
  subaccount_status: 'pending' | 'active' | 'inactive';
  paystack_subaccount_code?: string;
}

// Payment methods
export type PaymentMethod = 'Pay Online' | 'Cash On Delivery' | 'Pay On Credit';

// Payment channels supported by Paystack
export type PaystackChannel = 'card' | 'bank' | 'ussd' | 'mobile_money' | 'bank_transfer' | 'qr';

// Payment status from Paystack
export type PaystackPaymentStatus = 'success' | 'failed' | 'abandoned' | 'pending';

// Split calculation with delivery
export interface SplitWithDeliveryCalculation {
  total_amount: number;
  product_total: number;
  delivery_charge: number;
  admin_amount: number; // Platform total (5% of products + 100% delivery)
  seller_amount: number; // 95% of product price
  admin_percentage: number;
  seller_percentage: number;
  platform_product_fee: number; // 5% of product price
  platform_delivery_fee: number; // 100% of delivery charge
  platform_total: number; // platform_product_fee + platform_delivery_fee
}

// Hook return types
export interface UsePaystackReturn {
  // State
  isLoading: boolean;
  error: string | null;
  paymentData: PaystackVerificationData | null;
  publicKey: string | null;
  paymentReference: string | null;
  verificationData: PaystackVerificationData | null;
  
  // Actions
  initializePayment: (data: PaystackInitializeRequest) => Promise<PaystackInitializeResponse>;
  initializeSplitPayment: (data: SplitPaymentRequest | PaystackInitializeRequest) => Promise<PaystackInitializeResponse>;
  verifyPayment: (reference: string) => Promise<PaystackVerificationResponse>;
  refundPayment: (data: PaystackRefundRequest) => Promise<PaystackRefundResponse>;
  getPublicKey: () => Promise<PaystackPublicKeyResponse>;
  clearPaymentData: () => void;
  setPaymentReference: (reference: string | null) => void;
  setPaymentStatus: (status: PaystackState['paymentStatus']) => void;
  
  // Split Payment utilities
  calculateSplit: (amount: number, adminPercentage?: number) => SplitPaymentCalculation;
  calculateSplitWithDelivery: (productTotal: number, deliveryCharge: number, sellerPercentage?: number) => SplitWithDeliveryCalculation;
  formatSplitAmount: (calculation: SplitPaymentCalculation) => {
    total: string;
    admin: string;
    seller: string;
  };
  formatAmount: (amountInKobo: number) => string;
  toKobo: (amountInNaira: number) => number;
  fromKobo: (amountInKobo: number) => number;
  
  // Status
  paymentStatus: 'idle' | 'pending' | 'success' | 'failed' | 'cancelled';
  isPaymentInProgress: boolean;
  isPaymentSuccessful: boolean;
  isPaymentFailed: boolean;
  paystackState: PaystackState;
}
