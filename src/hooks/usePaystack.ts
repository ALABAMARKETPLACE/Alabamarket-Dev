import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { notification } from "antd";
import {
  initializePayment,
  initializeSplitPayment,
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
  PaystackInitializeResponse,
  PaystackPublicKeyResponse,
  PaystackRefundRequest,
  PaystackRefundResponse,
  PaystackVerificationResponse,
  UsePaystackReturn,
  SplitPaymentRequest,
  SplitPaymentCalculation,
} from "@/types/paystack.types";

export const usePaystack = (): UsePaystackReturn => {
  const dispatch = useAppDispatch();
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

  const shouldFallbackToNonSplitInitialize = (err: unknown): boolean => {
    if (!err || typeof err !== "object") return false;
    const maybeErr = err as Record<string, unknown>;
    const nestedData =
      typeof maybeErr.data === "object" && maybeErr.data !== null
        ? (maybeErr.data as Record<string, unknown>)
        : null;
    const rawMessage =
      (typeof nestedData?.message === "string" && nestedData.message) ||
      (typeof maybeErr.message === "string" && maybeErr.message) ||
      "";
    const msg = String(rawMessage).toLowerCase().trim();
    return (
      msg.includes("invalid store subaccount") ||
      msg.includes("no subaccount") ||
      (msg.includes("subaccount") &&
        (msg.includes("invalid") ||
          msg.includes("missing") ||
          msg.includes("not found")))
    );
  };

  const toNonSplitPaymentData = (
    data: PaystackInitializeRequest,
  ): PaystackInitializeRequest => {
    const next: PaystackInitializeRequest = { ...data };
    delete next.store_id;
    delete next.split_payment;
    return next;
  };

  const formatAmount = useCallback((amountInKobo: number): string => {
    return `₦${(amountInKobo / 100).toFixed(2)}`;
  }, []);

  /**
   * Calculate split amounts for product price only (legacy)
   * @deprecated Use calculateSplitWithDelivery for full split calculation
   */
  const calculateSplit = useCallback(
    (amount: number, adminPercentage: number = 5): SplitPaymentCalculation => {
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
    },
    [],
  );

  /**
   * Calculate split amounts with delivery charges
   * - Seller gets 95% of product price
   * - Platform gets 5% of product price + 100% of delivery charge
   */
  const calculateSplitWithDelivery = useCallback(
    (
      productTotal: number,
      deliveryCharge: number,
      sellerPercentage: number = 95,
    ) => {
      const platformPercentage = 100 - sellerPercentage;

      // Platform's share of product price (5%)
      const platformProductFee = Math.round(
        (productTotal * platformPercentage) / 100,
      );

      // Seller gets 95% of product price (no delivery charge)
      const sellerAmount = productTotal - platformProductFee;

      // Platform gets 5% of product + 100% of delivery
      const platformTotal = platformProductFee + deliveryCharge;

      // Total order amount
      const totalAmount = productTotal + deliveryCharge;

      return {
        total_amount: totalAmount,
        product_total: productTotal,
        delivery_charge: deliveryCharge,
        admin_amount: platformTotal,
        seller_amount: sellerAmount,
        admin_percentage: platformPercentage,
        seller_percentage: sellerPercentage,
        platform_product_fee: platformProductFee,
        platform_delivery_fee: deliveryCharge,
        platform_total: platformTotal,
      };
    },
    [],
  );

  const formatSplitAmount = useCallback(
    (calculation: SplitPaymentCalculation) => {
      return {
        total: formatAmount(calculation.total_amount),
        admin: formatAmount(calculation.admin_amount),
        seller: formatAmount(calculation.seller_amount),
      };
    },
    [formatAmount],
  );

  const toKobo = useCallback((amountInNaira: number): number => {
    return Math.round(amountInNaira * 100);
  }, []);

  const fromKobo = useCallback((amountInKobo: number): number => {
    return amountInKobo / 100;
  }, []);

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

        const result = (await dispatch(
          initializePayment(data),
        ).unwrap()) as PaystackInitializeResponse;
        if (result.status && result.data?.data?.authorization_url) {
          notificationApi.success({
            message: "Payment Initialized",
            description: "Redirecting to payment page...",
            duration: 2,
          });
          return result;
        } else {
          throw new Error(result?.message || "Payment initialization failed");
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to initialize payment. Please try again.";

        notificationApi.error({
          message: "Payment Failed",
          description: message,
          duration: 5,
        });

        throw err;
      }
    },
    [dispatch, notificationApi],
  );

  // Initialize split payment (supports both single and multi-store)
  const handleInitializeSplitPayment = useCallback(
    async (data: SplitPaymentRequest | PaystackInitializeRequest) => {
      try {
        // Clear previous errors
        dispatch(clearErrors());

        // Validate required fields for split payment
        if (!data?.email || !data?.amount || !data?.callback_url) {
          throw new Error("Missing required payment data");
        }

        // Check if this is a multi-store payment
        const isMultiStore =
          "stores" in data &&
          Array.isArray(data.stores) &&
          data.stores.length > 1;
        const isSingleStore =
          "store_id" in data && typeof data.store_id === "number";

        // Validate store information
        if (!isMultiStore && !isSingleStore) {
          // Check if stores array exists with single store
          if (
            "stores" in data &&
            Array.isArray(data.stores) &&
            data.stores.length === 1
          ) {
            // Single store in array format - still valid
          } else {
            throw new Error(
              "Store ID or stores array is required for split payments",
            );
          }
        }

        // Ensure amount is in kobo (minimum 100 kobo = 1 NGN)
        if (data.amount < 100) {
          throw new Error("Amount must be at least 100 kobo (1 NGN)");
        }

        // Calculate split for display
        const splitCalculation = calculateSplit(data.amount);

        // Build split payment data with appropriate metadata
        const splitPaymentData: PaystackInitializeRequest & {
          split_payment: boolean;
        } = {
          ...data,
          split_payment: true,
          metadata: {
            ...data.metadata,
            split_type: isMultiStore ? "multi_seller" : "automatic",
            admin_amount: splitCalculation.admin_amount,
            seller_amount: splitCalculation.seller_amount,
            is_multi_seller: isMultiStore,
          },
        };

        const result = (await dispatch(
          initializeSplitPayment(splitPaymentData),
        ).unwrap()) as PaystackInitializeResponse;
        if (result.status && result.data?.data?.authorization_url) {
          const formattedAmounts = formatSplitAmount(splitCalculation);

          const description = isMultiStore
            ? `Total: ${formattedAmounts.total} | Multi-seller split payment`
            : `Total: ${formattedAmounts.total} | Seller: ${formattedAmounts.seller} | Platform: ${formattedAmounts.admin}`;

          notificationApi.success({
            message: isMultiStore
              ? "Multi-Seller Payment Initialized"
              : "Split Payment Initialized",
            description,
            duration: 4,
          });
          return result;
        } else {
          throw new Error(
            result?.message || "Split payment initialization failed",
          );
        }
      } catch (err: unknown) {
        if (shouldFallbackToNonSplitInitialize(err)) {
          const fallbackResult = await handleInitializePayment(
            toNonSplitPaymentData(data),
          );
          notificationApi.info({
            message: "Split Not Available",
            description: "Proceeding with regular payment initialization.",
            duration: 4,
          });
          return fallbackResult;
        }

        const message =
          err instanceof Error
            ? err.message
            : "Failed to initialize split payment. Please try again.";

        notificationApi.error({
          message: "Split Payment Failed",
          description: message,
          duration: 5,
        });

        throw err;
      }
    },
    [
      dispatch,
      notificationApi,
      calculateSplit,
      formatSplitAmount,
      handleInitializePayment,
    ],
  );

  // Verify payment
  const handleVerifyPayment = useCallback(
    async (reference: string) => {
      try {
        if (!reference) {
          throw new Error("Payment reference is required");
        }

        const result = (await dispatch(
          verifyPayment(reference),
        ).unwrap()) as PaystackVerificationResponse;

        if (result.status) {
          const paymentData = result.data?.data;

          if (paymentData?.status === "success") {
            notificationApi.success({
              message: "Payment Successful",
              description: `Payment of ₦${(paymentData.amount / 100).toFixed(
                2,
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
          throw new Error(result?.message || "Payment verification failed");
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to verify payment. Please contact support.";

        notificationApi.error({
          message: "Verification Failed",
          description: message,
          duration: 5,
        });

        throw err;
      }
    },
    [dispatch, notificationApi],
  );

  // Process refund
  const handleRefundPayment = useCallback(
    async (data: PaystackRefundRequest) => {
      try {
        if (!data.transaction) {
          throw new Error("Transaction reference is required for refund");
        }

        const result = (await dispatch(
          processRefund(data),
        ).unwrap()) as PaystackRefundResponse;

        if (result.status) {
          notificationApi.success({
            message: "Refund Processed",
            description: "Refund has been processed successfully.",
            duration: 5,
          });
          return result;
        } else {
          throw new Error(result?.message || "Refund processing failed");
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to process refund. Please contact support.";

        notificationApi.error({
          message: "Refund Failed",
          description: message,
          duration: 5,
        });

        throw err;
      }
    },
    [dispatch, notificationApi],
  );

  // Get public key
  const handleGetPublicKey = useCallback(async () => {
    try {
      const result = (await dispatch(
        getPublicKey(),
      ).unwrap()) as PaystackPublicKeyResponse;
      return result;
    } catch (err: unknown) {
      throw err;
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
    [dispatch],
  );

  // Set payment status
  const setStatus = useCallback(
    (status: "idle" | "pending" | "success" | "failed" | "cancelled") => {
      dispatch(setPaymentStatus(status));
    },
    [dispatch],
  );

  // Auto-fetch public key on mount
  useEffect(() => {
    if (!publicKey) {
      handleGetPublicKey().catch(console.error);
    }
  }, [publicKey, handleGetPublicKey]);

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
    calculateSplitWithDelivery, // New: calculates split with delivery (95% seller, 5% + delivery to platform)
    formatSplitAmount,

    // Utilities
    formatAmount,
    toKobo,
    fromKobo,

    // Full state (for advanced usage)
    paystackState,
  };
};
