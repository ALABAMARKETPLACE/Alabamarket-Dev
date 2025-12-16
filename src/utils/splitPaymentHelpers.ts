import { SplitPaymentCalculation, SplitPaymentRequest } from '@/types/paystack.types';

/**
 * Split Payment Utilities
 * Helper functions for handling split payments in the frontend
 */

/**
 * Calculate split payment amounts
 */
export const calculateSplitAmounts = (
  amount: number, 
  adminPercentage: number = 5
): SplitPaymentCalculation => {
  const sellerPercentage = 100 - adminPercentage;
  const adminAmount = Math.round((amount * adminPercentage) / 100);
  const sellerAmount = amount - adminAmount;

  return {
    total_amount: amount,
    admin_amount: adminAmount,
    seller_amount: sellerAmount,
    admin_percentage: adminPercentage,
    seller_percentage: sellerPercentage,
  };
};

/**
 * Convert Naira to Kobo (Paystack expects amounts in kobo)
 */
export const nairaToKobo = (amountInNaira: number): number => {
  return Math.round(amountInNaira * 100);
};

/**
 * Convert Kobo to Naira
 */
export const koboToNaira = (amountInKobo: number): number => {
  return amountInKobo / 100;
};

/**
 * Format amount for display
 */
export const formatAmount = (amountInKobo: number): string => {
  return `₦${(amountInKobo / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format split amounts for display
 */
export const formatSplitAmounts = (calculation: SplitPaymentCalculation) => {
  return {
    total: formatAmount(calculation.total_amount),
    admin: formatAmount(calculation.admin_amount),
    seller: formatAmount(calculation.seller_amount),
  };
};

/**
 * Create split payment request object
 */
export const createSplitPaymentRequest = (params: {
  email: string;
  amount: number; // Amount in Naira
  storeId: number;
  orderId?: number;
  callbackUrl?: string;
  metadata?: Record<string, any>;
}): SplitPaymentRequest => {
  const { email, amount, storeId, orderId, callbackUrl, metadata } = params;
  
  return {
    email,
    amount: nairaToKobo(amount),
    store_id: storeId,
    order_id: orderId,
    split_payment: true,
    callback_url: callbackUrl || `${window.location.origin}/payment/callback`,
    metadata: {
      ...metadata,
      split_type: 'automatic',
      order_id: orderId?.toString(),
    },
  };
};

/**
 * Validate split payment data
 */
export const validateSplitPaymentData = (data: {
  email: string;
  amount: number;
  storeId: number;
}): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Validate email
  if (!data.email || !data.email.includes('@')) {
    errors.push('Valid email address is required');
  }

  // Validate amount
  if (!data.amount || data.amount <= 0) {
    errors.push('Amount must be greater than 0');
  } else if (data.amount < 1) {
    errors.push('Minimum amount is ₦1');
  }

  // Validate store ID
  if (!data.storeId || data.storeId <= 0) {
    errors.push('Valid store ID is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Generate payment reference
 */
export const generatePaymentReference = (prefix: string = 'split'): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`;
};

/**
 * Check if store supports split payments
 */
export const isStoreEligibleForSplitPayment = (store: {
  id: number;
  subaccount_status?: string;
  paystack_subaccount_code?: string;
}): boolean => {
  return !!(
    store.id &&
    store.subaccount_status === 'active' &&
    store.paystack_subaccount_code
  );
};

/**
 * Get split payment summary text
 */
export const getSplitPaymentSummary = (
  calculation: SplitPaymentCalculation,
  storeName?: string
): string => {
  const formatted = formatSplitAmounts(calculation);
  const seller = storeName || 'Seller';
  
  return `Total: ${formatted.total} | ${seller}: ${formatted.seller} (${calculation.seller_percentage}%) | Platform: ${formatted.admin} (${calculation.admin_percentage}%)`;
};

/**
 * Split payment configuration
 */
export const SPLIT_PAYMENT_CONFIG = {
  DEFAULT_ADMIN_PERCENTAGE: 5,
  DEFAULT_SELLER_PERCENTAGE: 95,
  MINIMUM_AMOUNT_NAIRA: 1,
  MINIMUM_AMOUNT_KOBO: 100,
  CURRENCY: 'NGN',
  CALLBACK_ENDPOINTS: {
    SUCCESS: '/payment/success',
    FAILED: '/payment/failed',
    CANCELLED: '/payment/cancelled',
  }
} as const;

/**
 * Split payment status messages
 */
export const SPLIT_PAYMENT_MESSAGES = {
  INITIALIZATION: {
    SUCCESS: 'Split payment initialized successfully',
    ERROR: 'Failed to initialize split payment',
  },
  VERIFICATION: {
    SUCCESS: 'Payment verified successfully',
    ERROR: 'Failed to verify payment',
  },
  VALIDATION: {
    INVALID_EMAIL: 'Please provide a valid email address',
    INVALID_AMOUNT: 'Please provide a valid amount',
    INVALID_STORE: 'Store is not eligible for split payments',
    MINIMUM_AMOUNT: `Minimum payment amount is ₦${SPLIT_PAYMENT_CONFIG.MINIMUM_AMOUNT_NAIRA}`,
  },
} as const;

export default {
  calculateSplitAmounts,
  nairaToKobo,
  koboToNaira,
  formatAmount,
  formatSplitAmounts,
  createSplitPaymentRequest,
  validateSplitPaymentData,
  generatePaymentReference,
  isStoreEligibleForSplitPayment,
  getSplitPaymentSummary,
  SPLIT_PAYMENT_CONFIG,
  SPLIT_PAYMENT_MESSAGES,
};