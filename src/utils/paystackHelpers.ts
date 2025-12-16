import {
  PaystackCallbackData,
  PaystackChannel,
  PaystackPaymentStatus,
} from "@/types/paystack.types";

// Currency formatting utilities
export const formatNairaAmount = (amountInKobo: number): string => {
  const nairaAmount = amountInKobo / 100;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(nairaAmount);
};

export const formatAmountDisplay = (amountInKobo: number): string => {
  const nairaAmount = amountInKobo / 100;
  return `₦${nairaAmount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Amount conversion utilities
export const nairaToKobo = (nairaAmount: number): number => {
  return Math.round(nairaAmount * 100);
};

export const koboToNaira = (koboAmount: number): number => {
  return koboAmount / 100;
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidAmount = (amount: number): boolean => {
  return amount >= 100 && amount <= 100000000; // 1 NGN to 1,000,000 NGN in kobo
};

export const isValidPhoneNumber = (phone: string): boolean => {
  // Nigerian phone number validation (supports +234, 0, and direct formats)
  const phoneRegex = /^(\+234|234|0)?[789][01]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ""));
};

// Payment reference utilities
export const generatePaymentReference = (prefix = "PAY"): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}_${timestamp}_${random}`;
};

export const isValidPaymentReference = (reference: string): any => {
  return reference && reference?.length > 5 && reference?.length <= 100;
};

// URL and callback utilities
export const parsePaystackCallback = (
  url: string
): PaystackCallbackData | null => {
  try {
    const urlObj = new URL(url);
    const reference = urlObj.searchParams.get("reference");
    const trxref = urlObj.searchParams.get("trxref");
    const status = urlObj.searchParams.get("status");

    if (!reference) {
      return null;
    }

    return {
      reference,
      trxref: trxref || undefined,
      status: status || undefined,
    };
  } catch (error) {
    console.error("Error parsing Paystack callback URL:", error);
    return null;
  }
};

export const buildCallbackUrl = (
  baseUrl: string,
  successPath: string,
  cancelPath?: string
): { success: string; cancel?: string } => {
  const cleanBase = baseUrl.replace(/\/$/, "");
  const cleanSuccessPath = successPath.replace(/^\//, "");
  const cleanCancelPath = cancelPath?.replace(/^\//, "");

  return {
    success: `${cleanBase}/${cleanSuccessPath}`,
    cancel: cleanCancelPath ? `${cleanBase}/${cleanCancelPath}` : undefined,
  };
};

// Payment status utilities
export const getPaymentStatusColor = (
  status: PaystackPaymentStatus
): string => {
  switch (status) {
    case "success":
      return "#52c41a"; // Green
    case "failed":
      return "#ff4d4f"; // Red
    case "abandoned":
      return "#faad14"; // Orange
    case "pending":
      return "#1890ff"; // Blue
    default:
      return "#8c8c8c"; // Gray
  }
};

export const getPaymentStatusText = (status: PaystackPaymentStatus): string => {
  switch (status) {
    case "success":
      return "Successful";
    case "failed":
      return "Failed";
    case "abandoned":
      return "Cancelled";
    case "pending":
      return "Pending";
    default:
      return "Unknown";
  }
};

export const getPaymentStatusIcon = (status: PaystackPaymentStatus): string => {
  switch (status) {
    case "success":
      return "✅";
    case "failed":
      return "❌";
    case "abandoned":
      return "⚠️";
    case "pending":
      return "⏳";
    default:
      return "❓";
  }
};

// Channel utilities
export const getChannelDisplayName = (channel: PaystackChannel): string => {
  switch (channel) {
    case "card":
      return "Debit/Credit Card";
    case "bank":
      return "Bank Account";
    case "ussd":
      return "USSD";
    case "mobile_money":
      return "Mobile Money";
    case "bank_transfer":
      return "Bank Transfer";
    case "qr":
      return "QR Code";
    default:
      return "Online Payment";
  }
};

export const getChannelIcon = (channel: PaystackChannel): string => {
  switch (channel) {
    case "card":
      return "💳";
    case "bank":
      return "🏦";
    case "ussd":
      return "📱";
    case "mobile_money":
      return "📲";
    case "bank_transfer":
      return "💸";
    case "qr":
      return "📷";
    default:
      return "💰";
  }
};

// Error handling utilities
export const getPaystackErrorMessage = (error: any): string => {
  if (typeof error === "string") {
    return error;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  if (error?.data?.message) {
    return error.data.message;
  }

  return "An unexpected error occurred. Please try again.";
};

export const isNetworkError = (error: any): boolean => {
  return (
    error?.code === "NETWORK_ERROR" ||
    error?.message?.includes("Network") ||
    error?.message?.includes("timeout") ||
    error?.status === 0
  );
};

export const isPaystackError = (error: any): boolean => {
  return (
    error?.code?.startsWith("PAYSTACK_") ||
    error?.source === "paystack" ||
    (error?.response && error.response.status >= 400)
  );
};

// Date and time utilities
export const formatPaymentDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-NG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (error) {
    return dateString;
  }
};

export const getTimeAgo = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
    } else {
      return formatPaymentDate(dateString);
    }
  } catch (error) {
    return dateString;
  }
};

// Security utilities
export const maskCardNumber = (cardNumber: string): string => {
  if (!cardNumber || cardNumber.length < 4) {
    return cardNumber;
  }

  const lastFour = cardNumber.slice(-4);
  const masked = "*".repeat(Math.max(0, cardNumber.length - 4));
  return `${masked}${lastFour}`;
};

export const maskEmail = (email: string): string => {
  const [username, domain] = email.split("@");
  if (!domain) return email;

  const maskedUsername =
    username.length > 2
      ? `${username.slice(0, 2)}${"*".repeat(username.length - 2)}`
      : username;

  return `${maskedUsername}@${domain}`;
};

// Retry utilities
export const createRetryFunction = <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): (() => Promise<T>) => {
  return async () => {
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (attempt === maxRetries) {
          throw lastError;
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
      }
    }

    throw lastError;
  };
};

// Local storage utilities for payment data
export const STORAGE_KEYS = {
  PAYMENT_DATA: "paystack_payment_data",
  PAYMENT_REFERENCE: "paystack_payment_reference",
  PUBLIC_KEY: "paystack_public_key",
} as const;

export const savePaymentData = (data: any): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_DATA, JSON.stringify(data));
  } catch (error) {
    console.warn("Failed to save payment data to localStorage:", error);
  }
};

export const getPaymentData = (): any | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PAYMENT_DATA);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn("Failed to get payment data from localStorage:", error);
    return null;
  }
};

export const clearPaymentData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.PAYMENT_DATA);
    localStorage.removeItem(STORAGE_KEYS.PAYMENT_REFERENCE);
  } catch (error) {
    console.warn("Failed to clear payment data from localStorage:", error);
  }
};
