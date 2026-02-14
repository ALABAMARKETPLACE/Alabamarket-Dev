"use client";
import { useCallback, useEffect, useState } from "react";
import "../../(user)/cart/styles.scss";
import { Container, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { notification } from "antd";

import NewAddressBox from "./_components/newAddressBox";
import PaymentBox from "./_components/paymentBox";
import SummaryCard from "./_components/summaryCard";
// import { getGuestAddress } from "./_components/guestAddressForm";

import { useRouter } from "next/navigation";
import { GET, POST, PUBLIC_POST } from "@/util/apicall";
import API from "@/config/API";
import { storeFinal } from "@/redux/slice/checkoutSlice";
import { useSession } from "next-auth/react";
import { useAppSelector } from "@/redux/hooks";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import { formatCurrency } from "@/utils/formatNumber";
import { formatGAItem, trackBeginCheckout } from "@/utils/analytics";
import { calculateDiscountedDelivery } from "@/config/promoConfig";

function Checkout() {
  const dispatch = useDispatch();
  const navigation = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;
  const isAuthenticated = status === "authenticated" && !!user;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customerId = (user as any)?.id || null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Checkout = useSelector((state: any) => state?.Checkout);
  const Settings = useAppSelector(reduxSettings);
  const [notificationApi, contextHolder] = notification.useNotification();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [payment_method, setPayment_method] = useState<any>("Pay Online");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [isLoading, setIsLoading] = useState<any>(false);
  const [deliveryToken, setDeliveryToken] = useState<string>("");

  // Guest email state (commented out for now)
  // const [guestEmail, setGuestEmail] = useState<string>("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [total, setTotal] = useState<any>(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [delivery_charge, setDelivery_charge] = useState<any>(0);
  const [discount, setDiscount] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [grand_total, setGrand_total] = useState<any>(0);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Clear any previous order creation status to allow new orders
    localStorage.removeItem("order_creation_completed");
    localStorage.removeItem("last_order_response");

    // Load guest email if available (commented out for now)
    // if (!isAuthenticated) {
    //   const savedData = getGuestAddress();
    //   if (savedData?.email) {
    //     setGuestEmail(savedData.email);
    //   }
    // }
  }, [isAuthenticated]);

  useEffect(() => {
    if (Checkout?.Checkout && Checkout.Checkout.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const gaItems = Checkout.Checkout.map((item: any) =>
        formatGAItem(item, null, item.quantity),
      );
      trackBeginCheckout(gaItems, total, Settings?.currency);
    }
  }, [Checkout?.Checkout, total, Settings?.currency]);

  console.log("user ", user);

  const [isDeliveryCalculating, setIsDeliveryCalculating] = useState(false);

  /* Guest inline Paystack setup temporarily disabled */

  const CalculateDeliveryCharge = useCallback(async () => {
    // Prevent multiple simultaneous calculations
    if (isDeliveryCalculating) return;

    // Check if we have necessary data to calculate
    if (
      !Checkout?.address?.id ||
      !Checkout?.Checkout ||
      Checkout.Checkout.length === 0
    ) {
      return;
    }

    try {
      setIsDeliveryCalculating(true);
      let totals = 0;
      if (Array.isArray(Checkout?.Checkout) === true) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Checkout?.Checkout?.forEach((item: any) => {
          totals += Number(item?.totalPrice);
        });
      }
      setTotal(totals);
      setGrand_total(totals);

      if (Checkout?.address?.id) {
        // Map address to ensure country_id and state_id are present and are numbers
        const addressData = {
          ...Checkout?.address,
          country_id: Number(
            Checkout?.address?.country_id ||
              Checkout?.address?.countryDetails?.id ||
              0,
          ),
          state_id: Number(
            Checkout?.address?.state_id ||
              Checkout?.address?.stateDetails?.id ||
              0,
          ),
          country: String(
            Checkout?.address?.country ||
              Checkout?.address?.countryDetails?.country_name ||
              "",
          ),
          state:
            Checkout?.address?.state || Checkout?.address?.stateDetails?.name,
        };

        // Use single item with quantity 1 for delivery calculation to avoid weight-based price scaling
        const firstItem = Checkout?.Checkout?.[0];
        const calculationCart = firstItem
          ? [
              {
                ...firstItem,
                id: Number(firstItem?.id || 0),
                productId: Number(firstItem?.productId || firstItem?.id || 0),
                quantity: 1,
                weight: Number(firstItem?.weight || 1), // Ensure weight exists
                totalPrice: Number(firstItem?.totalPrice || 0),
                storeId: Number(firstItem?.storeId || 0),
              },
            ]
          : Checkout?.Checkout;

        const obj = {
          cart: calculationCart,
          address: addressData,
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let response: any;

        // Use authenticated endpoint only (guest logic commented out)
        if (isAuthenticated) {
          response = await POST(API.NEW_CALCULATE_DELIVERY_CHARGE, obj);
        }
        // else {
        //   // For guest users, try public endpoint first, fallback to default estimation
        //   try {
        //     response = await PUBLIC_POST(
        //       API.PUBLIC_CALCULATE_DELIVERY_CHARGE,
        //       obj,
        //     );
        //     console.log("Guest delivery calculation response:", response);
        //   } catch (publicErr: unknown) {
        //     // If public endpoint fails (404 or not implemented), use default delivery charge
        //     console.log(
        //       "Public delivery calculation failed, using default estimation:",
        //       publicErr,
        //     );
        //
        //     // Default delivery charge estimation for guests
        //     const defaultDeliveryCharge = 2000; // Default delivery fee in Naira
        //     // Generate a guest token for order processing
        //     const guestToken = `GUEST_DELIVERY_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        //     setDeliveryToken(guestToken);
        //     setDelivery_charge(defaultDeliveryCharge);
        //     setGrand_total(totals + defaultDeliveryCharge);
        //     setDiscount(0);
        //     setIsDeliveryCalculating(false);
        //     return;
        //   }
        // }

        console.log("Delivery response:", response);

        if (response?.status) {
          const deliveryToken = response?.token || "";
          // API returns delivery charge in data.amount
          const delivery = Number(
            response?.data?.amount || response?.details?.totalCharge || 0,
          );
          const discountVal = Number(response?.data?.discount || 0);
          const gTotal = Number(totals) + Number(delivery) - discountVal;

          console.log(
            "Setting delivery charge:",
            delivery,
            "Grand total:",
            gTotal,
          );

          setDeliveryToken(deliveryToken);
          setDelivery_charge(delivery);
          setGrand_total(gTotal);
          setDiscount(discountVal);
        } else {
          notificationApi.error({
            message: "Delivery Not Available",
            description:
              response?.message || "Please select another delivery address.",
          });
          setDeliveryToken("");
          setDelivery_charge(0);
          setGrand_total(totals);
          setDiscount(0);
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setDelivery_charge(0);
      setDiscount(0);
      setDeliveryToken("");
      console.log(err);

      if (err?.response?.data?.message) {
        notificationApi.error({
          message: "Delivery Calculation Failed",
          description: err.response.data.message,
        });
      }
    } finally {
      setIsDeliveryCalculating(false);
    }
  }, [
    Checkout?.Checkout,
    Checkout?.address,
    isDeliveryCalculating,
    isAuthenticated,
    notificationApi,
  ]);

  useEffect(() => {
    // Only calculate if address and cart exist, and not already calculating
    if (Checkout?.address?.id && Checkout?.Checkout?.length > 0) {
      CalculateDeliveryCharge();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Checkout?.address?.id, Checkout?.Checkout]);

  const InitializePaystackPayment = async () => {
    try {
      setIsLoading(true);

      // Apply delivery promo discount if active
      const deliveryPromo = calculateDiscountedDelivery(
        Number(delivery_charge),
        Number(total),
      );
      const actualDeliveryCharge = deliveryPromo.discountedCharge;
      const actualGrandTotal =
        Number(total) + actualDeliveryCharge - Number(discount);

      // Convert amount to kobo (multiply by 100)
      const amountInKobo = Math.round(actualGrandTotal * 100);
      const deliveryChargeInKobo = Math.round(actualDeliveryCharge * 100);

      // Calculate product total (grand_total minus delivery_charge)
      // const productTotalInKobo = amountInKobo - deliveryChargeInKobo;

      // Log promo application
      if (deliveryPromo.hasDiscount) {
        console.log("🎉 Delivery promo applied:", {
          originalDelivery: delivery_charge,
          discountedDelivery: actualDeliveryCharge,
          savings: deliveryPromo.discountAmount,
          promoName: deliveryPromo.promo?.name,
        });
      }

      // Generate unique reference
      const reference = `ORDER_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`;

      // Email validation - log warning but don't block payment
      if (!user?.email) {
        console.warn(
          "Warning: User email not found. Proceeding with payment using available user data.",
        );
      }

      // Safely construct payment data with fallbacks
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyUser = user as any;
      const customerName = anyUser
        ? `${anyUser.first_name || "Customer"} ${anyUser.last_name || ""}`
        : Checkout?.address?.full_name || "Guest Customer";
      const customerEmail =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (user as any)?.email ||
        // guestEmail ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (user as any)?.id ||
        "customer@alabamarketplace.ng";
      // const resolvedCustomerId = (user as { id?: number })?.id || null;

      // Extract store IDs and group items by store for split payment
      // This supports both single-store and multi-store orders
      const storeMap = new Map<
        number,
        { storeId: number; total: number; items: unknown[] }
      >();

      Checkout?.Checkout?.forEach((item: Record<string, unknown>) => {
        const rawStoreId =
          (item as { storeId?: number; store_id?: number }).storeId ||
          (item as { store_id?: number }).store_id;
        // Ensure storeId is a valid number
        const storeId = rawStoreId ? Number(rawStoreId) : null;
        if (storeId && !isNaN(storeId) && storeId > 0) {
          const existing = storeMap.get(storeId) || {
            storeId,
            total: 0,
            items: [],
          };
          existing.total += Number(item?.totalPrice || 0);
          existing.items.push(item);
          storeMap.set(storeId, existing);
        }
      });

      const stores = Array.from(storeMap.values());
      const hasMultipleStores = stores.length > 1;
      const hasSingleStore = stores.length === 1;
      const shouldUseSplitPayment = isAuthenticated && stores.length > 0;

      // Calculate split amounts:
      // - Seller gets 95% of their product price
      // - Platform gets 5% of product price + 100% of delivery charge
      const SELLER_PERCENTAGE = 95;
      const PLATFORM_PERCENTAGE = 5;

      // Calculate total product price across all stores
      const totalProductPrice = stores.reduce((sum, s) => sum + s.total, 0);
      const totalProductPriceInKobo = Math.round(totalProductPrice * 100);

      // Platform gets: 5% of product price + all delivery charges
      const platformProductFeeInKobo = Math.round(
        (totalProductPriceInKobo * PLATFORM_PERCENTAGE) / 100,
      );
      const platformTotalInKobo =
        platformProductFeeInKobo + deliveryChargeInKobo;

      // Seller gets: 95% of their product price (no delivery charge)
      const sellerTotalInKobo =
        totalProductPriceInKobo - platformProductFeeInKobo;

      console.log("DEBUG: Payment Initialization", {
        cartLength: Checkout?.Checkout?.length,
        stores: stores.map((s) => ({ storeId: s.storeId, total: s.total })),
        hasMultipleStores,
        hasSingleStore,
        shouldUseSplitPayment,
        cartStoreIds: Checkout?.Checkout?.map(
          (item: Record<string, unknown>) =>
            (item as { storeId?: number; store_id?: number }).storeId ||
            (item as { store_id?: number }).store_id,
        ),
        splitBreakdown: {
          totalAmount: amountInKobo / 100,
          productTotal: totalProductPriceInKobo / 100,
          deliveryCharge: deliveryChargeInKobo / 100,
          platformFee: `5% of products = ${platformProductFeeInKobo / 100}`,
          platformTotal: `${platformProductFeeInKobo / 100} + ${deliveryChargeInKobo / 100} = ${platformTotalInKobo / 100}`,
          sellerTotal: sellerTotalInKobo / 100,
        },
      });

      // Console log for split payment breakdown
      console.log(
        "═══════════════════════════════════════════════════════════",
      );
      console.log("💰 SPLIT PAYMENT CALCULATION");
      console.log(
        "═══════════════════════════════════════════════════════════",
      );
      console.log(
        `📦 Product Total:      ₦${(totalProductPriceInKobo / 100).toLocaleString()}`,
      );
      console.log(
        `🚚 Delivery Charge:    ₦${(deliveryChargeInKobo / 100).toLocaleString()}`,
      );
      console.log(
        `💵 Grand Total:        ₦${(amountInKobo / 100).toLocaleString()}`,
      );
      console.log(
        "───────────────────────────────────────────────────────────",
      );
      console.log(`👤 SELLER GETS (95% of products):`);
      console.log(`   ₦${(sellerTotalInKobo / 100).toLocaleString()}`);
      console.log(
        "───────────────────────────────────────────────────────────",
      );
      console.log(`🏢 PLATFORM GETS (5% of products + 100% delivery):`);
      console.log(
        `   5% of ₦${(totalProductPriceInKobo / 100).toLocaleString()} = ₦${(platformProductFeeInKobo / 100).toLocaleString()}`,
      );
      console.log(
        `   + Delivery: ₦${(deliveryChargeInKobo / 100).toLocaleString()}`,
      );
      console.log(
        `   = Total: ₦${(platformTotalInKobo / 100).toLocaleString()}`,
      );
      console.log(
        "═══════════════════════════════════════════════════════════",
      );

      if (stores.length > 1) {
        console.log("🏪 MULTI-SELLER BREAKDOWN:");
        stores.forEach((s, idx) => {
          const storeProductInKobo = Math.round(s.total * 100);
          const sellerAmountInKobo = Math.round(
            (storeProductInKobo * SELLER_PERCENTAGE) / 100,
          );
          console.log(`   Store ${idx + 1} (ID: ${s.storeId}):`);
          console.log(
            `     Products: ₦${(storeProductInKobo / 100).toLocaleString()} → Seller gets: ₦${(sellerAmountInKobo / 100).toLocaleString()}`,
          );
        });
        console.log(
          "═══════════════════════════════════════════════════════════",
        );
      }

      // Build store allocation for multi-store split payments
      // Each seller gets 95% of their product price, platform gets 5% + delivery
      const storeAllocations = stores.map((s) => {
        const storeProductInKobo = Math.round(s.total * 100);
        const sellerAmountInKobo = Math.round(
          (storeProductInKobo * SELLER_PERCENTAGE) / 100,
        );
        const platformFeeFromStore = storeProductInKobo - sellerAmountInKobo;

        return {
          store_id: s.storeId,
          product_amount: storeProductInKobo, // Store's product total in kobo
          seller_amount: sellerAmountInKobo, // 95% of product price goes to seller
          platform_fee: platformFeeFromStore, // 5% of product price goes to platform
          item_count: s.items.length,
        };
      });

      // Build product items map for metadata (product_id, quantity, store_id)
      const productItems: Array<{
        product_id: number;
        quantity: number;
        store_id: number;
      }> =
        Array.isArray(Checkout?.Checkout) && Checkout.Checkout.length > 0
          ? Checkout.Checkout.map((it: Record<string, unknown>) => {
              const toNumber = (x: unknown): number | null => {
                const n =
                  typeof x === "string"
                    ? parseInt(x, 10)
                    : (x as number | null);
                return Number.isFinite(n as number) && (n as number) > 0
                  ? (n as number)
                  : null;
              };
              const product_id =
                toNumber((it as { productId?: number }).productId) ??
                toNumber((it as { id?: number }).id) ??
                toNumber((it as { pid?: number }).pid) ??
                toNumber(
                  ((it as { product?: Record<string, unknown> }).product || {})[
                    "id"
                  ] as number | undefined,
                ) ??
                toNumber(
                  ((it as { product?: Record<string, unknown> }).product || {})[
                    "pid"
                  ] as number | undefined,
                ) ??
                0;
              const store_id =
                toNumber((it as { store_id?: number }).store_id) ??
                toNumber((it as { storeId?: number }).storeId) ??
                toNumber(
                  ((it as { product?: Record<string, unknown> }).product || {})[
                    "store_id"
                  ] as number | undefined,
                ) ??
                0;
              const quantity =
                typeof (it as { quantity?: number }).quantity === "number"
                  ? (it as { quantity?: number }).quantity || 0
                  : 0;
              return { product_id, quantity, store_id };
            })
          : [];
      const productIds = productItems
        .map((pi) => pi.product_id)
        .filter((n) => typeof n === "number" && n > 0);

      const paymentData = {
        email: customerEmail,
        amount: amountInKobo,
        currency: "NGN",
        reference: reference,
        callback_url: `${window.location.origin}/checkoutsuccess/2`,
        // Add split payment parameters for both single and multi-store orders
        ...(shouldUseSplitPayment
          ? {
              ...(hasSingleStore
                ? { store_id: stores[0].storeId }
                : {
                    stores: stores.map((s) => s.storeId),
                    store_allocations: storeAllocations,
                  }),
              split_payment: true,
              // Include split calculation details for backend
              split_config: {
                seller_percentage: SELLER_PERCENTAGE,
                platform_percentage: PLATFORM_PERCENTAGE,
                product_total: totalProductPriceInKobo,
                delivery_charge: deliveryChargeInKobo,
                platform_total: platformTotalInKobo, // 5% of products + 100% delivery
                seller_total: sellerTotalInKobo, // 95% of products
              },
            }
          : {}),
        metadata: {
          order_id: reference,
          customer_id: customerId,
          stores: stores.map((s) => s.storeId),
          store_allocations: storeAllocations,
          is_multi_seller: hasMultipleStores,
          product_ids: productIds,
          product_items: productItems,
          delivery_token: deliveryToken || null,
          // Split breakdown for transparency
          split_breakdown: {
            product_total: totalProductPriceInKobo,
            delivery_charge: deliveryChargeInKobo,
            seller_percentage: SELLER_PERCENTAGE,
            platform_percentage: PLATFORM_PERCENTAGE,
            seller_gets: sellerTotalInKobo,
            platform_gets: platformTotalInKobo,
          },
          custom_fields: [
            {
              display_name: "Customer Name",
              variable_name: "customer_name",
              value: customerName,
            },
            {
              display_name: "Order Total",
              variable_name: "order_total",
              value: `₦${formatCurrency(grand_total)}`,
            },
            {
              display_name: "Product Total",
              variable_name: "product_total",
              value: `₦${formatCurrency(totalProductPriceInKobo / 100)}`,
            },
            {
              display_name: "Delivery Charge",
              variable_name: "delivery_charge",
              value: `₦${formatCurrency(delivery_charge)}`,
            },
            {
              display_name: "Seller Amount (95%)",
              variable_name: "seller_amount",
              value: `₦${formatCurrency(sellerTotalInKobo / 100)}`,
            },
            {
              display_name: "Platform Fee (5% + Delivery)",
              variable_name: "platform_fee",
              value: `₦${formatCurrency(platformTotalInKobo / 100)}`,
            },
            {
              display_name: "Number of Sellers",
              variable_name: "seller_count",
              value: String(stores.length),
            },
          ],
          cancel_url: `${window.location.origin}/checkout`,
        },
      };

      // Determine correct endpoint based on split payment; fallback to non-split if needed
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const wantsSplit = (paymentData as any).split_payment;
      const endpointPrimary = wantsSplit
        ? API.PAYSTACK_INITIALIZE_SPLIT
        : API.PAYSTACK_INITIALIZE;

      // Log split payment data for debugging
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((paymentData as any).split_payment) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const storeInfo = (paymentData as any).store_id
          ? `Single Store (${(paymentData as { store_id?: string }).store_id})`
          : `Multiple Stores (${Array.isArray((paymentData as { stores?: number[] }).stores) ? ((paymentData as { stores: number[] }).stores || []).join(", ") : ""})`;
        console.log("Initializing Split Payment:", {
          endpoint: endpointPrimary,
          paymentData,
          storeInfo,
          amount: paymentData.amount,
          split_type: "automatic (5% Platform / 95% Seller per store)",
        });
      } else {
        console.log("Initializing Regular Payment (no stores in cart):", {
          endpoint: endpointPrimary,
          amount: paymentData.amount,
        });
      }

      // Try primary endpoint first
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let response: any;
      try {
        // Guests always use PUBLIC_POST for initialize (split or non-split) (commented out for now)
        if (!isAuthenticated) {
          throw new Error("Guest checkout is temporarily disabled.");
        } else {
          response = await POST(endpointPrimary, paymentData);
        }
      } catch (primaryError: unknown) {
        const err =
          typeof primaryError === "object" && primaryError !== null
            ? (primaryError as Record<string, unknown>)
            : {};
        const errResponse =
          typeof err.response === "object" && err.response !== null
            ? (err.response as Record<string, unknown>)
            : {};
        const errData =
          typeof errResponse.data === "object" && errResponse.data !== null
            ? (errResponse.data as Record<string, unknown>)
            : {};
        const messageCandidate = errData.message ?? err.message ?? "";
        const primaryMessage =
          typeof messageCandidate === "string"
            ? messageCandidate.toLowerCase().trim()
            : "";
        const statusCode =
          typeof (err as { status?: unknown })?.status === "number"
            ? ((err as { status?: number }).status as number)
            : undefined;
        const shouldFallbackToNonSplit =
          wantsSplit &&
          (statusCode === 401 ||
            primaryMessage.includes("unauthorized") ||
            primaryMessage.includes("no token") ||
            primaryMessage.includes("invalid store subaccount") ||
            primaryMessage.includes("no subaccount") ||
            (primaryMessage.includes("subaccount") &&
              (primaryMessage.includes("invalid") ||
                primaryMessage.includes("missing") ||
                primaryMessage.includes("not found"))));

        if (shouldFallbackToNonSplit) {
          const nonSplitPaymentData: Record<string, unknown> = {
            ...paymentData,
          };
          delete nonSplitPaymentData.store_id;
          delete nonSplitPaymentData.split_payment;
          response = await (!isAuthenticated
            ? PUBLIC_POST(API.PAYSTACK_INITIALIZE, nonSplitPaymentData, null, {
                headers:
                  deliveryToken && String(deliveryToken).trim().length > 0
                    ? { Authorization: `Bearer ${deliveryToken}` }
                    : undefined,
              })
            : POST(API.PAYSTACK_INITIALIZE, nonSplitPaymentData));
        } else {
          throw primaryError;
        }
      }
      let rawUrl =
        response?.data?.data?.authorization_url ||
        response?.data?.authorization_url ||
        response?.authorization_url ||
        null;
      let authUrl =
        typeof rawUrl === "string"
          ? rawUrl.trim().replace(/^["'`]+|["'`]+$/g, "")
          : null;

      // Fallback to non-split initialize if split not available or URL missing
      if (!authUrl && wantsSplit) {
        const nonSplitPaymentData: Record<string, unknown> = { ...paymentData };
        delete nonSplitPaymentData.store_id;
        delete nonSplitPaymentData.split_payment;
        response = await POST(API.PAYSTACK_INITIALIZE, nonSplitPaymentData);
        rawUrl =
          response?.data?.data?.authorization_url ||
          response?.data?.authorization_url ||
          response?.authorization_url ||
          null;
        authUrl =
          typeof rawUrl === "string"
            ? rawUrl.trim().replace(/^["'`]+|["'`]+$/g, "")
            : null;
      }

      if (authUrl) {
        // Store payment reference for verification
        localStorage.setItem("paystack_payment_reference", reference);
        localStorage.setItem(
          "paystack_order_data",
          JSON.stringify({
            reference,
            amount: amountInKobo,
            email: paymentData.email,
            stores: stores.map((s) => s.storeId),
            is_multi_seller: hasMultipleStores,
            store_allocations: storeAllocations,
            // Include guest email for guest orders (commented out)
            // guest_email: !isAuthenticated ? guestEmail : undefined,
            order_data: {
              payment: {
                ref: reference,
                type: payment_method,
                split_payment: shouldUseSplitPayment,
                is_multi_seller: hasMultipleStores,
              },
              cart: Checkout?.Checkout,
              address: Checkout?.address,
              charges: {
                token: deliveryToken,
              },
              user_id: customerId,
              user: user,
              // Add guest_email to order_data for backend (commented out)
              // guest_email: !isAuthenticated ? guestEmail : undefined,
            },
          }),
        );

        // Redirect to Paystack payment page
        window.location.href = authUrl;
      } else {
        throw new Error(response.message || "Payment initialization failed");
      }

      setIsLoading(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setIsLoading(false);
      console.error("Payment initialization error:", err);

      // Enhanced error handling
      const errorData = err.response?.data;
      let errorMessage = "Payment Failed";
      let errorDescription = "Something went wrong. Please try again";

      // Handle specific Paystack errors
      if (errorData?.code === "CHANNEL_NOT_ACTIVE") {
        errorMessage = "Payment Service Unavailable";
        errorDescription =
          "The payment service is temporarily unavailable. Please try again later or contact support.";
      } else if (errorData?.code === "INVALID_EMAIL") {
        errorMessage = "Invalid Email Address";
        errorDescription = "Please check your email address and try again.";
      } else if (errorData?.code === "INVALID_AMOUNT") {
        errorMessage = "Invalid Amount";
        errorDescription =
          "The payment amount is invalid. Please refresh and try again.";
      } else if (errorData?.message) {
        errorDescription = errorData.message;
      } else if (err.message) {
        errorDescription = err.message;
      }

      // Check for network errors
      if (err.name === "NetworkError" || err.code === "NETWORK_ERROR") {
        errorMessage = "Network Error";
        errorDescription =
          "Please check your internet connection and try again.";
      }

      notificationApi.error({
        message: errorMessage,
        description: errorDescription,
        duration: 6,
      });
    }
  };

  const PlaceOrder = async () => {
    // Validate guest checkout has email
    // if (!isAuthenticated && !guestEmail) {
    //   notificationApi.error({
    //     message: "Email Required",
    //     description:
    //       "Please enter your email address in the delivery details form.",
    //   });
    //   return;
    // }

    if (deliveryToken) {
      try {
        // Apply delivery promo discount if active
        const deliveryPromo = calculateDiscountedDelivery(
          Number(delivery_charge),
          Number(total),
        );
        const actualDeliveryCharge = deliveryPromo.discountedCharge;

        const obj = {
          payment: payment_method,
          cart: Checkout?.Checkout,
          address: Checkout?.address,
          charges: {
            token: deliveryToken,
            // Include promo info for backend
            originalDeliveryCharge: delivery_charge,
            discountedDeliveryCharge: actualDeliveryCharge,
            deliveryDiscount: deliveryPromo.discountAmount,
            promoApplied: deliveryPromo.hasDiscount,
            promoId: deliveryPromo.promo?.id || null,
            promoName: deliveryPromo.promo?.name || null,
          },
          user_id: customerId,
          user: user,
          // Guest checkout data (commented out)
          is_guest: !isAuthenticated,
          // guest_email: guestEmail || null,
        };
        dispatch(storeFinal(obj));
        if (payment_method === "Pay Online") {
          InitializePaystackPayment();
        } else if (payment_method === "Pay On Credit") {
          notificationApi.error({
            message: `This Order will be processed only after the Admin approves the Credit payment.`,
          });
        } else {
          navigation.replace("/checkoutsuccess/1");
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      if (Checkout?.address?.id) {
        notificationApi.error({
          message:
            "Delivery to the selected address is not available. Please choose another one.",
        });
        return;
      }
      notificationApi.error({
        message: `Please Choose a Delivery Address to place an Order`,
      });
    }
  };

  // Handler for guest email updates - wrapped in useCallback to prevent infinite loops
  // const handleGuestEmailChange = useCallback((email: string) => {
  //   setGuestEmail(email);
  // }, []);

  return (
    <div className="Screen-box" style={{ backgroundImage: "none" }}>
      {contextHolder}
      <br />
      <Container fluid style={{ minHeight: "80vh" }}>
        <Row>
          <Col sm={7}>
            <NewAddressBox />
            <PaymentBox
              method={payment_method}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={(value: any) => setPayment_method(value)}
              isGuest={!isAuthenticated}
            />
            <br />
          </Col>
          <Col sm={5}>
            <div className="Cart-box2">
              <SummaryCard
                Cart={Checkout}
                total={total}
                delivery_charge={delivery_charge}
                grand_total={grand_total}
                placeOrder={() => PlaceOrder()}
                loading={isLoading}
                discount={discount}
              />
            </div>
          </Col>
        </Row>
      </Container>
      <br />
    </div>
  );
}
export default Checkout;
