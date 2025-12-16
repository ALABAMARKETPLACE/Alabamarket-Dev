import { useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/redux/hooks";
import { notification } from "antd";
import {
  initializePayment,
  verifyPayment,
  getPublicKey,
  processRefund,
  setPaymentReference,
  setPaymentStatus,
  clearPaymentData,
  clearErrors,
  selectPaystackState,
  selectIsLoading,
  selectPaymentStatus,
  selectPaymentReference,
  selectVerificationData,
  selectPublicKey,
  selectPaymentErrors,
} from "@/redux/slice/paystackSlice";
import {
  PaystackInitializeRequest,
  PaystackRefundRequest,
  UsePaystackReturn,
  SplitPaymentRequest,
  SplitPaymentCalculation,
} from "@/types/paystack.types";

export const usePaystack = (): any => {
  const dispatch = useDispatch<any>();
  const [notificationApi] = notification.useNotification();

  // Selectors
  const paystackState = useAppSelector(selectPaystackState);
  const isLoading = useAppSelector(selectIsLoading);
  const paymentStatus = useAppSelector(selectPaymentStatus);
  const paymentReference = useAppSelector(selectPaymentReference);
  const verificationData = useAppSelector(selectVerificationData);
  const publicKey = useAppSelector(selectPublicKey);
  const errors = useAppSelector(selectPaymentErrors);

  // Get current error message
  const error = errors.initialization || errors.verification || errors.refund;

  // Initialize payment
  const handleInitializePayment = useCallback(
    async (data: PaystackInitializeRequest) => {
      try {
        // Clear previous errors
        dispatch(clearErrors());

        // Validate required fields
        if (!data?.email || !data?.amount || !data?.callback_url) {
          throw new Error("Missing required payment data");
        }

        // Ensure amount is in kobo (minimum 100 kobo = 1 NGN)
        if (data.amount < 100) {
          throw new Error("Amount must be at least 100 kobo (1 NGN)");
        }

        const result: any = await dispatch(initializePayment(data)).unwrap();

        if (result.status && result.data?.data?.authorization_url) {
          // Payment initialization successful
          notificationApi.success({
            message: "Payment Initialized",
            description: "Redirecting to payment page...",
            duration: 2,
          });
          return result;
        } else {
          throw new Error(result.message || "Payment initialization failed");
        }
      } catch (error: any) {
        console.error("Payment initialization error:", error);

        notificationApi.error({
          message: "Payment Failed",
          description:
            error.message || "Failed to initialize payment. Please try again.",
          duration: 5,
        });

        throw error;
      }
    },
    [dispatch, notificationApi]
  );

  // Initialize split payment
  const handleInitializeSplitPayment = useCallback(
    async (data: SplitPaymentRequest) => {
      try {
        // Clear previous errors
        dispatch(clearErrors());

        // Validate required fields for split payment
        if (!data?.email || !data?.amount || !data?.callback_url) {
          throw new Error("Missing required payment data");
        }

        if (!data?.store_id) {
          throw new Error("Store ID is required for split payments");
        }

        // Ensure amount is in kobo (minimum 100 kobo = 1 NGN)
        if (data.amount < 100) {
          throw new Error("Amount must be at least 100 kobo (1 NGN)");
        }

        // Calculate split for display
        const splitCalculation = calculateSplit(data.amount);

        // Set split_payment flag
        const splitPaymentData = {
          ...data,
          split_payment: true,
          metadata: {
            ...data.metadata,
            split_type: "automatic",
            admin_amount: splitCalculation.admin_amount,
            seller_amount: splitCalculation.seller_amount,
          },
        };

        const result: any = await dispatch(initializePayment(splitPaymentData)).unwrap();

        if (result.status && result.data?.data?.authorization_url) {
          // Split payment initialization successful
          const formattedAmounts = formatSplitAmount(splitCalculation);
          
          notificationApi.success({
            message: "Split Payment Initialized",
            description: `Total: ${formattedAmounts.total} | Seller: ${formattedAmounts.seller} | Platform: ${formattedAmounts.admin}`,
            duration: 4,
          });
          return result;
        } else {
          throw new Error(result.message || "Split payment initialization failed");
        }
      } catch (error: any) {
        console.error("Split payment initialization error:", error);

        notificationApi.error({
          message: "Split Payment Failed",
          description:
            error.message || "Failed to initialize split payment. Please try again.",
          duration: 5,
        });

        throw error;
      }
    },
    [dispatch, notificationApi]
  );

  // Verify payment
  const handleVerifyPayment = useCallback(
    async (reference: string) => {
      try {
        if (!reference) {
          throw new Error("Payment reference is required");
        }

        const result = await dispatch(verifyPayment(reference)).unwrap();

        if (result.status) {
          const paymentData = result.data?.data;

          if (paymentData?.status === "success") {
            notificationApi.success({
              message: "Payment Successful",
              description: `Payment of ₦${(paymentData.amount / 100).toFixed(
                2
              )} verified successfully.`,
              duration: 5,
            });
          } else if (paymentData?.status === "failed") {
            notificationApi.error({
              message: "Payment Failed",
              description:
                paymentData.gateway_response || "Payment was not successful.",
              duration: 5,
            });
          }

          return result;
        } else {
          throw new Error(result.message || "Payment verification failed");
        }
      } catch (error: any) {
        console.error("Payment verification error:", error);

        notificationApi.error({
          message: "Verification Failed",
          description:
            error.message ||
            "Failed to verify payment. Please contact support.",
          duration: 5,
        });

        throw error;
      }
    },
    [dispatch, notificationApi]
  );

  // Process refund
  const handleRefundPayment = useCallback(
    async (data: PaystackRefundRequest) => {
      try {
        if (!data.transaction) {
          throw new Error("Transaction reference is required for refund");
        }

        const result = await dispatch(processRefund(data)).unwrap();

        if (result.status) {
          notificationApi.success({
            message: "Refund Processed",
            description: "Refund has been processed successfully.",
            duration: 5,
          });
          return result;
        } else {
          throw new Error(result.message || "Refund processing failed");
        }
      } catch (error: any) {
        console.error("Refund processing error:", error);

        notificationApi.error({
          message: "Refund Failed",
          description:
            error.message ||
            "Failed to process refund. Please contact support.",
          duration: 5,
        });

        throw error;
      }
    },
    [dispatch, notificationApi]
  );

  // Get public key
  const handleGetPublicKey = useCallback(async () => {
    try {
      const result = await dispatch(getPublicKey()).unwrap();
      return result;
    } catch (error: any) {
      console.error("Get public key error:", error);
      throw error;
    }
  }, [dispatch]);

  // Clear payment data
  const handleClearPaymentData = useCallback(() => {
    dispatch(clearPaymentData());
  }, [dispatch]);

  // Set payment reference
  const setReference = useCallback(
    (reference: string | null) => {
      dispatch(setPaymentReference(reference));
    },
    [dispatch]
  );

  // Set payment status
  const setStatus = useCallback(
    (status: "idle" | "pending" | "success" | "failed" | "cancelled") => {
      dispatch(setPaymentStatus(status));
    },
    [dispatch]
  );

  // Auto-fetch public key on mount
  useEffect(() => {
    if (!publicKey) {
      handleGetPublicKey().catch(console.error);
    }
  }, [publicKey, handleGetPublicKey]);

  // Utility function to format amount
  const formatAmount = useCallback((amountInKobo: number): string => {
    return `₦${(amountInKobo / 100).toFixed(2)}`;
  }, []);

  // Utility function to convert amount to kobo
  const toKobo = useCallback((amountInNaira: number): number => {
    return Math.round(amountInNaira * 100);
  }, []);

  // Utility function to convert amount from kobo
  const fromKobo = useCallback((amountInKobo: number): number => {
    return amountInKobo / 100;
  }, []);

  // Calculate split amounts (5% admin, 95% seller)
  const calculateSplit = useCallback((amount: number, adminPercentage: number = 5): SplitPaymentCalculation => {
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
  }, []);

  // Format split amounts for display
  const formatSplitAmount = useCallback((calculation: SplitPaymentCalculation) => {
    return {
      total: formatAmount(calculation.total_amount),
      admin: formatAmount(calculation.admin_amount),
      seller: formatAmount(calculation.seller_amount),
    };
  }, [formatAmount]);

  // Check if payment is in progress
  const isPaymentInProgress = paymentStatus === "pending";

  // Check if payment was successful
  const isPaymentSuccessful = paymentStatus === "success";

  // Check if payment failed
  const isPaymentFailed =
    paymentStatus === "failed" || paymentStatus === "cancelled";

  return {
    // State
    isLoading,
    error,
    paymentData: verificationData,
    publicKey,
    paymentStatus,
    paymentReference,
    verificationData,

    // Computed state
    isPaymentInProgress,
    isPaymentSuccessful,
    isPaymentFailed,

    // Actions
    initializePayment: handleInitializePayment,
    initializeSplitPayment: handleInitializeSplitPayment,
    verifyPayment: handleVerifyPayment,
    refundPayment: handleRefundPayment,
    getPublicKey: handleGetPublicKey,
    clearPaymentData: handleClearPaymentData,
    setPaymentReference: setReference,
    setPaymentStatus: setStatus,

    // Split Payment utilities
    calculateSplit,
    formatSplitAmount,

    // Utilities
    formatAmount,
    toKobo,
    fromKobo,

    // Full state (for advanced usage)
    paystackState,
  };
};
