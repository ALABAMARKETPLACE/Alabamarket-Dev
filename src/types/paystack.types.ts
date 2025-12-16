// Paystack TypeScript type definitions for frontend

export interface PaystackInitializeRequest {
  email: string;
  amount: number; // Amount in kobo
  currency?: string;
  callback_url: string;
  reference?: string;
  store_id?: number; // For split payments
  order_id?: number; // For order tracking
  split_payment?: boolean; // Enable automatic split (5% admin, 95% seller)
  metadata?: {
    cancel_url?: string;
    custom_fields?: Array<{
      display_name: string;
      variable_name: string;
      value: string;
    }>;
    [key: string]: any;
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
  metadata: any;
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
  metadata: any;
  fees: number;
  customer: PaystackCustomer;
  authorization: PaystackAuthorization;
  plan: any;
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
        authorization: any;
        customer: any;
        plan: any;
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
  refundData: any | null;
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
  data?: any;
}

// Split Payment specific types
export interface SplitPaymentRequest extends PaystackInitializeRequest {
  store_id: number; // Required for split payments
  split_payment: true; // Always true for split payments
}

export interface SplitPaymentCalculation {
  total_amount: number;
  admin_amount: number;
  seller_amount: number;
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

// Hook return types
export interface UsePaystackReturn {
  // State
  isLoading: boolean;
  error: string | null;
  paymentData: PaystackVerificationData | null;
  publicKey: string | null;
  
  // Actions
  initializePayment: (data: PaystackInitializeRequest) => Promise<PaystackInitializeResponse>;
  initializeSplitPayment: (data: SplitPaymentRequest) => Promise<PaystackInitializeResponse>;
  verifyPayment: (reference: string) => Promise<PaystackVerificationResponse>;
  refundPayment: (data: PaystackRefundRequest) => Promise<PaystackRefundResponse>;
  getPublicKey: () => Promise<PaystackPublicKeyResponse>;
  clearPaymentData: () => void;
  
  // Split Payment utilities
  calculateSplit: (amount: number, adminPercentage?: number) => SplitPaymentCalculation;
  formatSplitAmount: (calculation: SplitPaymentCalculation) => {
    total: string;
    admin: string;
    seller: string;
  };
  
  // Status
  paymentStatus: 'idle' | 'pending' | 'success' | 'failed' | 'cancelled';
}