"use client";

interface CheckoutCartItem {
  productId?: number;
  id?: number;
  name: string;
  variantId?: number;
  combination?: string;
  quantity: number;
  store_id?: number;
  weight?: number;
  totalPrice?: number;
}
interface GuestCartItem {
  product_id: number;
  product_name: string;
  variant_id?: number;
  variant_name?: string;
  quantity: number;
  store_id: number;
  weight?: number;
}

interface GuestOrderPayload {
  guest_info: {
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    country_code: string;
  };
  cart_items: GuestCartItem[];
  delivery_address: {
    full_name: string;
    phone_no: string;
    country_code: string;
    full_address: string;
    city: string;
    state: string;
    state_id: number;
    country: string;
    country_id: number;
    landmark?: string;
    address_type?: string;
  };
  delivery: {
    delivery_token: string;
    delivery_charge: number;
    total_weight: number;
    estimated_delivery_days?: number | null;
  };
  payment: {
    payment_reference: string;
    payment_method: string;
    transaction_reference: string;
    amount_paid: number;
    payment_status: string;
    paid_at: string;
  };
  order_summary: {
    subtotal: number;
    delivery_fee: number;
    tax: number;
    discount: number;
    total: number;
  };
  metadata: {
    order_notes?: string;
    source?: string;
    device_id?: string;
    preferred_delivery_time?: string | null;
  };
  is_multi_seller: boolean;
}

import { useCallback, useEffect, useState } from "react";
import "./styles.scss";
import PostOrderReviewModal from "./_components/PostOrderReviewModal";
import { useSelector, useDispatch } from "react-redux";
import { VscError } from "react-icons/vsc";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { Col, Container, Row } from "react-bootstrap";
import { Avatar, Button, List, Spin, notification } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import { clearCheckout } from "@/redux/slice/checkoutSlice";
import { POST, DELETE } from "@/util/apicall";
import API from "@/config/API";
import { clearCart } from "@/redux/slice/cartSlice";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import { useSession } from "next-auth/react";
import { formatGAItem, trackPurchase } from "@/utils/analytics";
import { getActiveDeliveryPromo } from "@/config/promoConfig";

interface Order {
  newOrder?: {
    status?: string;
    reason?: string;
    total?: number | string;
    discount?: number | string;
    tax?: number | string;
    grandTotal?: number | string;
    deliveryCharge?: number | string;
  };
  status?: string;
  reason?: string;
  remark?: string;
  orderStatus?: {
    remark?: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orderItems?: any[];
  orderId?: string;
  _id?: string;
  deliveryCharge?: number | string;
}

const antIcon = <LoadingOutlined style={{ fontSize: 50 }} spin />;

function getCurrencySymbol(currency: string) {
  if (currency === "NGN") {
    return "₦";
  }
  return currency || "₦";
}

function Checkout() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Checkout = useSelector((state: any) => state?.Checkout?.order);
  const Settings = useAppSelector(reduxSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<boolean>();
  const [orderStatus, setOrderStatus] = useState<boolean>();
  const [Notifications, contextHolder] = notification.useNotification();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: user }: any = useSession();
  const User = user?.user;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // const [orderItems, setOrderItems] = useState<any[]>([]); // No longer used
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [responseData, setResponseData] = useState<any>({});
  const [orderCreated, setOrderCreated] = useState(false);
  const [paymentRef, setPaymentRef] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reviewProducts, setReviewProducts] = useState<any[]>([]);

  const triggerReviewModal = useCallback((data: unknown[]) => {
    const isUUID = (v: unknown): v is string =>
      typeof v === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cartItems: any[] = Array.isArray(Checkout?.cart) ? Checkout.cart : [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: any[] = [];
    data.forEach((order) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const o = order as any;
      if (Array.isArray(o?.orderItems)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        o.orderItems.forEach((item: any) => {
          // First check if the orderItem itself already carries the product UUID
          const directUUID =
            (isUUID(item?.product?._id) ? item.product._id : null) ??
            (isUUID(item?.product?.pid) ? item.product.pid : null) ??
            (isUUID(item?._id) ? item._id : null);

          if (!directUUID) {
            // Fall back to cross-referencing the cart for the product UUID
            const numericPid = item?.product_id ?? item?.productId;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const cartMatch = cartItems.find((c: any) => {
              const cPid =
                c?.productId ??
                c?.product_id ??
                c?.product?.id ??
                c?.product?.pid;
              // eslint-disable-next-line eqeqeq
              return cPid != null && cPid == numericPid;
            });
            const cartUUID =
              (isUUID(cartMatch?.product?._id) ? cartMatch.product._id : null) ??
              (isUUID(cartMatch?.product?.pid) ? cartMatch.product.pid : null) ??
              (isUUID(cartMatch?._id) ? cartMatch._id : null);
            items.push({ ...item, _id: cartUUID ?? item?._id });
          } else {
            items.push({ ...item, _id: directUUID });
          }
        });
      }
    });
    if (items.length > 0) {
      setReviewProducts(items);
      setTimeout(() => setShowReviewModal(true), 1800);
    }
  }, [Checkout]);

  // Get route parameter to determine payment method
  const routeId = params?.id;
  const isCOD = routeId === "1";
  const isPaystack = routeId === "2";

  // Read the actual Paystack reference from URL or localStorage (do NOT generate a new one)
  useEffect(() => {
    if (isPaystack) {
      const urlRef = searchParams.get("reference") || searchParams.get("ref");
      const storedRef = localStorage.getItem("paystack_payment_reference");
      const ref = urlRef || storedRef || null;
      setPaymentRef(ref);
    }
  }, [isPaystack, searchParams]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getOrderItems = useCallback((response: any[]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const array: any[] = [];
    if (Array.isArray(response)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      response.forEach((items: any) => {
        if (Array.isArray(items?.orderItems)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          items?.orderItems.forEach((item2: any) => {
            array.push(item2);
          });
        }
      });
    }
  }, []);

  const PlaceOrder = useCallback(async () => {
    // Synchronous lock to prevent React Strict Mode double-mount duplicate orders
    // Must be checked BEFORE setOrderCreated (state is not shared across double-mounts)
    const globalLockKey = "order_creation_in_progress";
    if (localStorage.getItem(globalLockKey)) {
      // Another invocation is already running. Wait briefly then load from cache.
      setTimeout(() => {
        const existingOrderData = localStorage.getItem("last_order_response");
        if (existingOrderData) {
          try {
            const orderData = JSON.parse(existingOrderData);
            getOrderItems(orderData);
            setResponseData(orderData);
            setOrderStatus(true);
            setPaymentStatus(true);
            setIsLoading(false);
            triggerReviewModal(Array.isArray(orderData) ? orderData : []);
          } catch (e) {
            console.error("Error loading cached order data", e);
            setIsLoading(false);
          }
        } else {
          // Stale lock — page crashed or navigated away mid-processing with no cached result.
          // Clear it so the spinner doesn't run forever.
          localStorage.removeItem(globalLockKey);
          const wasCompleted = localStorage.getItem("order_creation_completed");
          setPaymentStatus(true);
          setOrderStatus(wasCompleted ? true : false);
          setIsLoading(false);
        }
      }, 2000);
      return;
    }
    localStorage.setItem(globalLockKey, "1");

    try {
      setOrderCreated(true); // Prevent multiple executions within same instance

      let finalOrderData;

      if (isCOD) {
        // COD Order Flow - No payment verification needed
        console.log("Processing COD order...");

        finalOrderData = {
          payment: {
            ref: null,
            type: "Cash On Delivery",
          },
          cart: Checkout?.cart,
          address: Checkout?.address,
          charges: Checkout?.charges,
          user_id:
            User?.id ?? Checkout?.user_id ?? Checkout?.address?.user_id ?? null,
          user: User ?? Checkout?.user ?? null,
        };
      } else if (isPaystack) {
        // Paystack Order Flow - Verify payment first
        console.log("Processing Paystack order...");

        // Robustly select a valid payment reference
        const paystackRef =
          (typeof paymentRef === "string" && paymentRef.trim()) ||
          (typeof searchParams.get("reference") === "string" &&
            searchParams.get("reference")?.trim()) ||
          (typeof searchParams.get("ref") === "string" &&
            searchParams.get("ref")?.trim()) ||
          (typeof localStorage.getItem("paystack_payment_reference") ===
            "string" &&
            localStorage.getItem("paystack_payment_reference")?.trim()) ||
          null;
        if (!paystackRef) {
          throw new Error("Payment reference not found. Please try again.");
        }
        console.log("Paystack payment reference:", paystackRef);

        // Load stored order data (for other order info, not for token)
        const storedOrderData = localStorage.getItem("paystack_order_data");
        const orderData = storedOrderData ? JSON.parse(storedOrderData) : null;

        // Verify payment with backend
        console.log("Verifying payment with reference:", paymentRef);
        // Guest checkout disabled

        // Robust verification with fallbacks for guest
        let verificationResponse: Record<string, unknown> | null = null;
        let vStatus = "";
        let vAmount = 0;
        let vGatewayResponse: string | null = null;
        const skipVerify = false;
        verificationResponse = await POST(API.PAYSTACK_VERIFY, {
          reference: paystackRef,
        });

        console.log("Payment verification response:", verificationResponse);

        if (!skipVerify && verificationResponse) {
          const vObj = (
            verificationResponse as { data?: Record<string, unknown> }
          )?.data
            ? ((verificationResponse as { data: Record<string, unknown> })
                .data as Record<string, unknown>)
            : (verificationResponse as Record<string, unknown>);
          vStatus = String(vObj?.status ?? "");
          vAmount = Number(
            typeof vObj?.amount === "number"
              ? vObj?.amount
              : ((vObj?.amount as number | undefined) ?? 0),
          );
          vGatewayResponse =
            (vObj?.gateway_response as string | undefined) || null;
          if (!vStatus) {
            throw new Error(
              (verificationResponse as { message?: string })?.message ||
                "Payment verification failed. Please try again.",
            );
          }
        } else if (skipVerify) {
          vStatus = "success";
          const maybeOrderDataAmount =
            (orderData?.amount as number | undefined) ||
            (orderData?.order_data?.payment?.amount as number | undefined) ||
            null;
          vAmount =
            Number(maybeOrderDataAmount) ||
            Number(
              Array.isArray(Checkout?.cart)
                ? Checkout.cart.reduce(
                    (sum: number, it: Record<string, unknown>) =>
                      sum +
                      (Number((it as { totalPrice?: number }).totalPrice) || 0),
                    0,
                  )
                : 0,
            ) + Number(Checkout?.charges?.totalCharge || 0);
          vGatewayResponse = "INLINE_OK";
        }

        // Payment verified successfully, proceed with order

        // Check if this is a multi-seller order
        const isMultiSeller = orderData?.is_multi_seller || false;
        const storeAllocations = orderData?.store_allocations || [];

        finalOrderData = orderData?.order_data || {
          payment: {
            ref: isMultiSeller || storeAllocations.length > 1 ? null : paystackRef,
            transaction_reference: paystackRef,
            type: "Pay Online",
            status: vStatus || "success",
            amount: vAmount || null,
            gateway_response: vGatewayResponse,
            split_payment: isMultiSeller || storeAllocations.length > 0,
            is_multi_seller: isMultiSeller,
          },
          cart: Checkout?.cart,
          address: Checkout?.address,
          charges: Checkout?.charges,
          user_id:
            User?.id ?? Checkout?.user_id ?? Checkout?.address?.user_id ?? null,
          user: User ?? Checkout?.user ?? null,
        };

        // Ensure payment info includes verification data.
        // For multi-seller orders the backend creates one orderPayment record per store —
        // reusing the same `ref` hits a unique constraint. Set ref=null for multi-seller
        // and always carry the Paystack reference in `transaction_reference` instead.
        const isMultiSellerPayment =
          isMultiSeller || storeAllocations.length > 1;
        finalOrderData.payment = {
          ...finalOrderData.payment,
          ref: isMultiSellerPayment ? null : paystackRef,
          transaction_reference: paystackRef,
          status: vStatus || "success",
          amount: vAmount || null,
          gateway_response: vGatewayResponse,
          verified: true,
          verified_at: new Date().toISOString(),
        };

        const resolvedUserId =
          finalOrderData.user_id ??
          finalOrderData.userId ??
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (finalOrderData.user as any)?.id ??
          Checkout?.user_id ??
          Checkout?.address?.user_id ??
          User?.id ??
          null;

        finalOrderData.user_id = resolvedUserId;

        // Ensure IDs are numbers if they are numeric strings
        if (finalOrderData.user_id && !isNaN(Number(finalOrderData.user_id))) {
          finalOrderData.user_id = Number(finalOrderData.user_id);
        }
        if (finalOrderData.userId && !isNaN(Number(finalOrderData.userId))) {
          finalOrderData.userId = Number(finalOrderData.userId);
        }
        // Shallow-copy address before mutating to avoid Redux state mutation
        if (finalOrderData.address) {
          finalOrderData.address = { ...finalOrderData.address };
        }
        if (
          finalOrderData.address?.id &&
          !isNaN(Number(finalOrderData.address.id))
        ) {
          finalOrderData.address.id = Number(finalOrderData.address.id);
        }
        if (
          finalOrderData.address?.user_id &&
          !isNaN(Number(finalOrderData.address.user_id))
        ) {
          finalOrderData.address.user_id = Number(
            finalOrderData.address.user_id,
          );
        }

        if (!finalOrderData.userId && resolvedUserId) {
          finalOrderData.userId = resolvedUserId;
        }

        if (!finalOrderData.user && User) {
          finalOrderData.user = User;
        }

        // Add guest_email for guest orders (from stored Paystack data or verification response)
        const isGuestOrder =
          finalOrderData.address?.is_guest || !finalOrderData.user_id;
        if (isGuestOrder) {
          // Get guest email from Paystack verification or stored order data
          const guestEmail =
            ((
              verificationResponse as {
                data?: { customer?: { email?: string } };
              }
            )?.data?.customer?.email as string | undefined) ||
            ((verificationResponse as { customer?: { email?: string } })
              ?.customer?.email as string | undefined) ||
            orderData?.email ||
            finalOrderData.address?.email;
          if (guestEmail) {
            finalOrderData.guest_email = guestEmail;
          }
        }

        console.log("Final Order Payload:", finalOrderData);
      } else {
        // Unknown route
        throw new Error("Invalid checkout route. Please try again.");
      }

      console.log("Final order data:", finalOrderData);

      // Normalize cart items to ensure store_id and product_id are present for multi-seller order creation
      if (Array.isArray(finalOrderData?.cart)) {
        finalOrderData.cart = finalOrderData.cart.map(
          (item: CheckoutCartItem) => {
            const asRecord = item as unknown as Record<string, unknown>;
            // Extract store_id from various possible field names
            const store_id =
              (item as CheckoutCartItem)?.store_id ??
              (item as { storeId?: number })?.storeId ??
              (
                asRecord.product as
                  | { store_id?: number; storeId?: number }
                  | undefined
              )?.store_id ??
              (
                asRecord.product as
                  | { store_id?: number; storeId?: number }
                  | undefined
              )?.storeId ??
              null;
            // Extract product_id from various possible field names
            const toNumber = (x: unknown): number | null => {
              const n =
                typeof x === "string" ? parseInt(x, 10) : (x as number | null);
              return Number.isFinite(n as number) && (n as number) > 0
                ? (n as number)
                : null;
            };
            const product_id =
              toNumber((item as { productId?: number }).productId) ??
              toNumber((item as { id?: number }).id) ??
              toNumber((item as { pid?: number }).pid) ??
              toNumber(
                ((asRecord.product as Record<string, unknown>) || {})["id"],
              ) ??
              toNumber(
                ((asRecord.product as Record<string, unknown>) || {})["pid"],
              ) ??
              (asRecord.product_id as number | undefined) ??
              null;
            // Remove storeId from the item if present
            const rest = { ...item };
            delete (rest as { storeId?: unknown }).storeId;
            return {
              ...rest,
              store_id:
                store_id != null ? Number(store_id) : (store_id as null),
              product_id:
                product_id != null ? Number(product_id) : (product_id as null),
              quantity: Number((item as { quantity?: number }).quantity ?? 0),
              totalPrice: Number(
                (item as { totalPrice?: number }).totalPrice ?? 0,
              ),
            } as CheckoutCartItem;
          },
        );
      }

      // Debug: Log cart items to verify storeId is present
      console.log(
        "═══════════════════════════════════════════════════════════",
      );
      console.log("📦 ORDER CREATION - CART ITEMS DEBUG");
      console.log(
        "═══════════════════════════════════════════════════════════",
      );
      if (Array.isArray(finalOrderData?.cart)) {
        const storeGroups = new Map<number | string, CheckoutCartItem[]>();
        finalOrderData.cart.forEach((item: CheckoutCartItem, index: number) => {
          const store_id =
            (item as CheckoutCartItem)?.store_id ||
            (item as { storeId?: number })?.storeId ||
            (item as { product?: { store_id?: number } })?.product?.store_id ||
            "unknown";
          console.log(`Item ${index + 1}:`, {
            name:
              (item as CheckoutCartItem)?.name ||
              (item as { product?: { name?: string } })?.product?.name,
            store_id: store_id,
            quantity: (item as CheckoutCartItem)?.quantity,
            totalPrice: (item as CheckoutCartItem)?.totalPrice,
          });

          if (!storeGroups.has(store_id)) {
            storeGroups.set(store_id, []);
          }
          storeGroups.get(store_id)?.push(item as CheckoutCartItem);
        });

        console.log(
          "───────────────────────────────────────────────────────────",
        );
        console.log(`🏪 Total Stores: ${storeGroups.size}`);
        storeGroups.forEach((items, storeId) => {
          console.log(`   Store ${storeId}: ${items.length} items`);
        });
        console.log(
          "═══════════════════════════════════════════════════════════",
        );
      }

      // Validate cart data
      if (
        !finalOrderData?.cart ||
        !Array.isArray(finalOrderData.cart) ||
        finalOrderData.cart.length === 0
      ) {
        console.error("Invalid cart data:", finalOrderData?.cart);
        throw new Error(
          "Cart is empty. Unable to process order. Please start over.",
        );
      }

      // Validate address data (guest addresses have IDs like "guest_123456")
      if (
        !finalOrderData?.address ||
        (!finalOrderData.address.id && !finalOrderData.address.is_guest)
      ) {
        console.error("Invalid address data:", finalOrderData?.address);
        throw new Error(
          "Delivery address is invalid. Please go back and select a valid address.",
        );
      }

      // Validate charges data (guest tokens start with "GUEST_DELIVERY_")
      const isGuestToken =
        finalOrderData?.charges?.token?.startsWith("GUEST_DELIVERY_");
      // Allow empty token when delivery charge is 0 — this happens when no
      // delivery configuration exists for the user's state (backend returns
      // status: false and checkout sets token="" with totalCharge=0).
      const isZeroDelivery =
        Number(finalOrderData?.charges?.totalCharge ?? -1) === 0;
      if (
        !finalOrderData?.charges ||
        (!finalOrderData.charges.token && !isGuestToken && !isZeroDelivery)
      ) {
        console.error("Invalid charges data:", finalOrderData?.charges);
        throw new Error(
          "Delivery charge calculation failed. Please go back and recalculate.",
        );
      }

      // Ensure payment amount is in correct format (Paystack returns Kobo)
      // We pass it as is, assuming backend handles Kobo/Naira conversion or comparison
      console.log(
        "Submitting order with payment amount:",
        finalOrderData?.payment?.amount,
      );

      // Determine if this is a multi-seller order (applies to authenticated)
      const storeIds = new Set<string | number>();
      if (Array.isArray(finalOrderData?.cart)) {
        finalOrderData.cart.forEach((item: CheckoutCartItem) => {
          const store_id =
            (item as CheckoutCartItem)?.store_id ||
            (item as { storeId?: number })?.storeId ||
            (item as { product?: { store_id?: number } })?.product?.store_id;
          if (store_id) storeIds.add(store_id);
        });
      }
      const isMultiSeller =
        storeIds.size > 1 || finalOrderData?.payment?.is_multi_seller || false;

      // Add is_multi_seller flag to finalOrderData for backend
      finalOrderData.is_multi_seller = isMultiSeller;
      // Also include explicit stores list for backend grouping
      finalOrderData.stores = Array.from(storeIds);

      // Build store allocations to help backend validate/store grouping
      if (
        Array.isArray(finalOrderData?.cart) &&
        finalOrderData.cart.length > 0
      ) {
        const allocationMap = new Map<
          number | string,
          {
            store_id: number | string;
            product_amount: number;
            item_count: number;
          }
        >();
        finalOrderData.cart.forEach((ci: CheckoutCartItem) => {
          const sid =
            (ci as { store_id?: number | string }).store_id ??
            (ci as { storeId?: number | string }).storeId;
          if (sid == null) return;
          const key = sid as number | string;
          const existing = allocationMap.get(key) || {
            store_id: key,
            product_amount: 0,
            item_count: 0,
          };
          existing.product_amount += Number(
            (ci as { totalPrice?: number }).totalPrice ?? 0,
          );
          existing.item_count += 1;
          allocationMap.set(key, existing);
        });
        const store_allocations = Array.from(allocationMap.values());
        (finalOrderData as Record<string, unknown>)["store_allocations"] =
          store_allocations;

        // Diagnostics
        console.log("🧾 ORDER GROUPING DIAGNOSTICS");
        console.log("Stores:", finalOrderData.stores);
        console.log("Allocations:", store_allocations);
        const byStoreCounts = Array.from(storeIds).map((sid) => ({
          store_id: sid,
          items:
            finalOrderData.cart?.filter(
              (ci: CheckoutCartItem) =>
                ((ci as { store_id?: unknown }).store_id ??
                  (ci as { storeId?: unknown }).storeId) === sid,
            ).length ?? 0,
        }));
        console.log("Items per store:", byStoreCounts);
      }

      // Determine if this is a guest order
      const isGuestOrder =
        finalOrderData?.address?.is_guest ||
        !finalOrderData?.user_id ||
        finalOrderData?.guest_email;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let response: any;

      if (isGuestOrder) {
        // Parse full_name into first_name and last_name
        const fullName = finalOrderData?.address?.full_name || "";
        const nameParts = fullName.trim().split(/\s+/);
        const firstName = nameParts[0] || "Guest";
        const lastName = nameParts.slice(1).join(" ") || "User";
        const countryCode = finalOrderData?.address?.country_code || "+234";
        const guestOrderPayload: GuestOrderPayload = {
          guest_info: {
            email:
              finalOrderData?.guest_email ||
              finalOrderData?.address?.email ||
              "",
            first_name: firstName,
            last_name: lastName,
            phone: finalOrderData?.address?.phone_no || "",
            country_code: countryCode,
          },
          cart_items: Array.isArray(finalOrderData?.cart)
            ? finalOrderData.cart.map(
                (item: CheckoutCartItem | Record<string, unknown>) => {
                  const asRecord = item as Record<string, unknown>;
                  const candidates = [
                    (item as CheckoutCartItem)?.productId,
                    (item as { id?: number })?.id,
                    (item as { pid?: number })?.pid,
                    (asRecord.product as Record<string, unknown> | undefined)
                      ?.id,
                    (asRecord.product as Record<string, unknown> | undefined)
                      ?.pid,
                    asRecord.product_id as number | undefined,
                  ];
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
                    toNumber(candidates[0]) ??
                    toNumber(candidates[1]) ??
                    toNumber(candidates[2]) ??
                    toNumber(candidates[3]) ??
                    toNumber(candidates[4]) ??
                    toNumber(candidates[5]) ??
                    0;

                  const product_name =
                    (item as CheckoutCartItem)?.name ||
                    ((asRecord.product as Record<string, unknown> | undefined)
                      ?.name as string | undefined) ||
                    "";

                  const variant_id_candidate =
                    (item as CheckoutCartItem)?.variantId ??
                    ((
                      asRecord.productVariant as
                        | Record<string, unknown>
                        | undefined
                    )?.id as number | undefined) ??
                    null;
                  const variant_id =
                    variant_id_candidate != null
                      ? (toNumber(variant_id_candidate) ?? null)
                      : null;

                  const store_id =
                    toNumber((item as CheckoutCartItem)?.store_id) ??
                    toNumber((item as { storeId?: number })?.storeId) ??
                    toNumber(
                      (asRecord.product as Record<string, unknown> | undefined)
                        ?.store_id,
                    ) ??
                    0;
                  const unit_price =
                    typeof (asRecord as { price?: unknown })?.price === "number"
                      ? (asRecord as { price?: number }).price
                      : Number(
                          (item as { unit_price?: number })?.unit_price || 0,
                        );
                  const total_price =
                    typeof (asRecord as { totalPrice?: unknown })
                      ?.totalPrice === "number"
                      ? (asRecord as { totalPrice?: number }).totalPrice
                      : Number(
                          (item as { total_price?: number })?.total_price || 0,
                        );
                  const image =
                    ((asRecord.product as Record<string, unknown> | undefined)
                      ?.image as string | undefined) ||
                    ((asRecord as { image?: string })?.image as
                      | string
                      | undefined) ||
                    null;

                  return {
                    product_id,
                    product_name,
                    variant_id,
                    variant_name: (item as CheckoutCartItem)?.combination,
                    quantity: Number((item as CheckoutCartItem)?.quantity || 0),
                    store_id,
                    weight: Number((item as CheckoutCartItem)?.weight || 0),
                    unit_price,
                    total_price,
                    image,
                  };
                },
              )
            : [],
          delivery_address: {
            full_name: fullName,
            phone_no: finalOrderData?.address?.phone_no || "",
            country_code: countryCode,
            full_address: finalOrderData?.address?.full_address || "",
            city: finalOrderData?.address?.city || "Lagos",
            state: finalOrderData?.address?.state || "Lagos",
            state_id: Number(finalOrderData?.address?.state_id || 25),
            country: finalOrderData?.address?.country || "Nigeria",
            country_id: Number(finalOrderData?.address?.country_id || 160),
            landmark: finalOrderData?.address?.landmark,
            address_type: finalOrderData?.address?.address_type,
          },
          delivery: {
            delivery_token: finalOrderData?.charges?.token || "",
            delivery_charge: finalOrderData?.charges?.totalCharge || 0,
            total_weight: Array.isArray(finalOrderData?.cart)
              ? finalOrderData.cart.reduce(
                  (sum: number, item: CheckoutCartItem) =>
                    sum + (item.weight || 0),
                  0,
                )
              : 0,
            estimated_delivery_days:
              ((finalOrderData?.charges as Record<string, unknown>)?.[
                "estimated_days"
              ] as number | undefined) ?? null,
          },
          payment: {
            payment_reference: finalOrderData?.payment?.ref || "",
            payment_method: finalOrderData?.payment?.type || "paystack",
            transaction_reference:
              finalOrderData?.payment?.transaction_reference ||
              finalOrderData?.payment?.ref ||
              "",
            amount_paid: finalOrderData?.payment?.amount || 0,
            payment_status: finalOrderData?.payment?.status || "success",
            paid_at:
              finalOrderData?.payment?.verified_at || new Date().toISOString(),
          },
          order_summary: {
            subtotal: Array.isArray(finalOrderData?.cart)
              ? finalOrderData.cart.reduce(
                  (sum: number, item: CheckoutCartItem) =>
                    sum + (item.totalPrice || 0),
                  0,
                )
              : 0,
            delivery_fee: finalOrderData?.charges?.totalCharge || 0,
            tax: 0,
            discount: 0,
            total:
              (Array.isArray(finalOrderData?.cart)
                ? finalOrderData.cart.reduce(
                    (sum: number, item: CheckoutCartItem) =>
                      sum + (item.totalPrice || 0),
                    0,
                  )
                : 0) + (finalOrderData?.charges?.totalCharge || 0),
          },
          metadata: {
            order_notes: finalOrderData?.notes || "",
            preferred_delivery_time:
              ((finalOrderData as Record<string, unknown>)?.[
                "preferred_delivery_time"
              ] as string | undefined) || null,
            source: finalOrderData?.source || "web_app",
            device_id: finalOrderData?.device_id || "",
          },
          is_multi_seller: isMultiSeller,
        };

        // Validate payload before submitting
        const invalidItems =
          Array.isArray(guestOrderPayload.cart_items) &&
          guestOrderPayload.cart_items.filter(
            (ci) => !ci.product_id || Number(ci.product_id) <= 0,
          );
        if (Array.isArray(invalidItems) && invalidItems.length > 0) {
          console.error("Invalid guest cart items:", invalidItems);
          Notifications["error"]({
            message: "Order Validation Failed",
            description:
              "Some cart items are missing product IDs. Please remove and re-add those items, then try again.",
          });
          setIsLoading(false);
          return;
        }

        response = await POST(API.ORDER, finalOrderData);
      } else {
        // Create order for authenticated users (payment already verified above for Paystack)
        response = await POST(API.ORDER, finalOrderData);
      }
      console.log(
        "Order creation response:",
        JSON.stringify(response, null, 2),
      );

      if (response?.status) {
        // Check for failed status in response data
        const orders = response?.data;

        // If any order failed, treat the whole order as failed
        const anyFailed =
          Array.isArray(orders) &&
          orders.some(
            (order: Order) =>
              order?.newOrder?.status === "failed" ||
              order?.status === "failed",
          );

        if (anyFailed) {
          // Find the first failed order for the reason
          const firstFailed = Array.isArray(orders)
            ? orders.find(
                (order: Order) =>
                  order?.newOrder?.status === "failed" ||
                  order?.status === "failed",
              )
            : null;
          const failureReason =
            firstFailed?.newOrder?.reason ||
            firstFailed?.reason ||
            firstFailed?.remark ||
            firstFailed?.orderStatus?.remark ||
            "Unknown error";

          // Do NOT reuse the reference after a failed order
          if (isPaystack) {
            localStorage.removeItem("paystack_payment_reference");
            localStorage.removeItem("paystack_order_data");
            setPaymentRef(null);
          }

          Notifications["error"]({
            message: "Order Processing Failed",
            description: `Order processing failed: ${failureReason}. Please try again or contact support.`,
          });
          setPaymentStatus(true);
          setOrderStatus(false);
          setIsLoading(false);
          return;
        }

        // If all orders succeeded, proceed as success
        getOrderItems(response?.data);
        setResponseData(response?.data);

        // Store order response for duplicate prevention
        localStorage.setItem(
          "last_order_response",
          JSON.stringify(response?.data),
        );
        localStorage.setItem("order_creation_completed", "true");

        setOrderStatus(true);
        triggerReviewModal(Array.isArray(response?.data) ? response.data : []);

        // Track Purchase
        if (response?.data && Array.isArray(response.data)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const allItems: any[] = [];
          let totalValue = 0;
          let totalShipping = 0;
          let totalTax = 0;
          const firstOrder = response.data[0];

          response.data.forEach((order: Order) => {
            if (order?.orderItems && Array.isArray(order.orderItems)) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              order.orderItems.forEach((item: any) => {
                allItems.push(formatGAItem(item, null, item.quantity));
              });
            }
            totalValue += Number(
              order?.newOrder?.grandTotal || order?.newOrder?.total || 0,
            );
            totalShipping += Number(order?.newOrder?.deliveryCharge || 0);
            totalTax += Number(order?.newOrder?.tax || 0);
          });

          if (firstOrder && allItems.length > 0) {
            trackPurchase(
              firstOrder.orderId || firstOrder._id,
              allItems,
              totalValue,
              Settings?.currency,
              totalShipping,
              totalTax,
            );
          }
        }

        // Clear stored payment data for successful orders
        if (isPaystack) {
          localStorage.removeItem("paystack_payment_reference");
          localStorage.removeItem("paystack_order_data");
          setPaymentRef(null);
        }

        // Clear cart from backend, redux, and guest localStorage
        try {
          await DELETE(API.CART_CLEAR_ALL);
        } catch (e) {
          console.error("Failed to clear cart from backend", e);
        }
        // clearCart() empties Redux cart state AND removes guest cart from localStorage
        dispatch(clearCart());

        dispatch(clearCheckout());

        setPaymentStatus(true);
        localStorage.removeItem(globalLockKey); // Release lock on success
      } else {
        const extractStr = (val: unknown): string | undefined => {
          if (typeof val === "string" && val.trim()) return val.trim();
          if (val && typeof val === "object") {
            const obj = val as Record<string, unknown>;
            const inner = obj["message"] ?? obj["error"] ?? obj["detail"];
            if (typeof inner === "string" && inner.trim()) return inner.trim();
          }
          return undefined;
        };
        Notifications["error"]({
          message: extractStr(response?.message) ?? "Order Could Not Be Completed",
          description:
            extractStr(response?.description) ??
            extractStr(response?.error) ??
            "We were unable to place your order at this time. Your payment is safe — please contact support if the issue persists.",
        });
        setPaymentStatus(true);
        setOrderStatus(false);
        localStorage.removeItem(globalLockKey); // Release lock so user can retry
      }

      setIsLoading(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setPaymentStatus(true);
      setOrderStatus(false);
      setIsLoading(false);
      localStorage.removeItem(globalLockKey); // Release lock so user can retry

      console.error("Order creation error:", err);
      Notifications["error"]({
        message: "Order Processing Failed",
        description:
          err?.message ||
          err?.response?.data?.message ||
          "Something went wrong while processing your order.",
      });
    }
  }, [
    Checkout?.address,
    Checkout?.cart,
    Checkout?.charges,
    Checkout?.user,
    Checkout?.user_id,
    Notifications,
    Settings?.currency,
    User,
    dispatch,
    getOrderItems,
    isCOD,
    isPaystack,
    searchParams,
    paymentRef,
    triggerReviewModal,
  ]);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Prevent duplicate order creation
    const orderAlreadyCreated = localStorage.getItem(
      "order_creation_completed",
    );
    if (orderAlreadyCreated && !orderCreated) {
      // If order was already created, try to load existing data
      const existingOrderData = localStorage.getItem("last_order_response");
      if (existingOrderData) {
        try {
          const orderData = JSON.parse(existingOrderData);
          setResponseData(orderData);
          getOrderItems(orderData);
          setOrderStatus(true);
          setPaymentStatus(true);
          setIsLoading(false);
          triggerReviewModal(Array.isArray(orderData) ? orderData : []);
          return;
        } catch (e) {
          console.error("Error parsing existing order data", e);
        }
      }
    }

    if (!orderCreated) {
      PlaceOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderCreated]);

  // Cleanup function to reset order creation status when component unmounts
  useEffect(() => {
    return () => {
      // Don't clear order data on unmount to prevent issues with navigation
      // Order data will be cleared on successful order completion or new checkout
    };
  }, []);

  return (
    <div className="Screen-box">
      {contextHolder}
      <Container fluid style={{ minHeight: "80vh", padding: "32px 16px" }}>
        {isLoading ? (
          /* ── LOADING ── */
          <div className="cs-center-box">
            <div className="cs-icon-ring cs-icon-ring--green">
              <Spin indicator={antIcon} />
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", marginBottom: 8 }}>
              Processing Your Order
            </div>
            <div style={{ fontSize: 14, color: "#888" }}>
              Please do not press the back button or close this tab.
            </div>
          </div>
        ) : paymentStatus ? (
          orderStatus ? (
            /* ── SUCCESS ── */
            <Row className="g-3">
              {/* Left hero */}
              <Col sm={7} xs={12}>
                <div className="cs-success-hero">
                  <div className="cs-icon-ring cs-icon-ring--solid">
                    <IoIosCheckmarkCircleOutline size={48} color="#fff" />
                  </div>
                  <div className="cs-label-green">Order Confirmed</div>
                  <div className="cs-title">Thank You!</div>
                  <div className="cs-subtitle">
                    Your order has been placed successfully. We&apos;ll send a
                    confirmation to your registered email shortly.
                  </div>
                  <div className="cs-action-row">
                    <Button
                      type="primary"
                      size="large"
                      onClick={() =>
                        router.push(
                          `/user/orders/${responseData?.[0]?.orderId || responseData?.[0]?._id}`,
                        )
                      }
                      style={{ borderRadius: 10, minWidth: 150 }}
                    >
                      Track My Order
                    </Button>
                    <Button
                      size="large"
                      onClick={() => router.replace("/")}
                      style={{ borderRadius: 10, minWidth: 150 }}
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </div>
              </Col>

              {/* Right order card */}
              <Col sm={5} xs={12}>
                <div className="cs-order-card">
                  {/* Card header */}
                  <div className="cs-card-header">
                    <span className="cs-card-header__title">Order Summary</span>
                    <span className="cs-status-badge">
                      {Array.isArray(responseData) &&
                      responseData.some(
                        (o: Order) =>
                          o?.newOrder?.status === "Confirmed" ||
                          o?.status === "Confirmed",
                      )
                        ? "Confirmed"
                        : responseData?.[0]?.newOrder?.status || "Confirmed"}
                    </span>
                  </div>

                  {/* Delivery address */}
                  <div className="cs-card-section">
                    <div className="cs-section-label">Delivery Address</div>
                    <div className="cs-section-body">
                      {responseData?.[0]?.address?.fullAddress ?? ""}
                      {responseData?.[0]?.address?.street
                        ? `, ${responseData[0].address.street}`
                        : ""}
                      {responseData?.[0]?.address?.state
                        ? `, ${responseData[0].address.state}`
                        : ""}
                      {responseData?.[0]?.address?.pin_code
                        ? ` - ${responseData[0].address.pin_code}`
                        : ""}
                    </div>
                    {responseData?.[0]?.address?.alt_phone && (
                      <div className="cs-section-body" style={{ marginTop: 4 }}>
                        {responseData[0].address.alt_phone}
                      </div>
                    )}
                  </div>

                  {/* Payment */}
                  <div className="cs-card-section">
                    <div className="cs-section-label">Payment</div>
                    <div className="cs-row-between">
                      <span className="cs-section-body">
                        {(() => {
                          const paymentType =
                            responseData?.[0]?.orderPayment?.paymentType;
                          if (
                            paymentType &&
                            paymentType.toLowerCase().includes("cash")
                          ) {
                            const promo = getActiveDeliveryPromo();
                            if (promo) return "Online Payment";
                            return "Cash On Delivery";
                          }
                          if (
                            paymentType &&
                            paymentType.toLowerCase().includes("online")
                          ) {
                            return "Online Payment";
                          }
                          return "Online Payment";
                        })()}
                      </span>
                      <span style={{ fontWeight: 700, color: "#1a1a1a", fontSize: 14 }}>
                        {getCurrencySymbol(Settings?.currency)}{" "}
                        {(() => {
                          const promo = getActiveDeliveryPromo();
                          let amount = Number(
                            responseData?.[0]?.orderPayment?.amount || 0,
                          );
                          if (promo) {
                            const delivery = Number(
                              responseData?.[0]?.newOrder?.deliveryCharge ||
                                responseData?.[0]?.deliveryCharge ||
                                0,
                            );
                            amount = amount - delivery;
                          }
                          return amount.toFixed(2);
                        })()}
                      </span>
                    </div>
                  </div>

                  {/* Items by store */}
                  <div className="cs-card-section cs-items-scroll">
                    <div className="cs-section-label">Items Ordered</div>
                    {Array.isArray(responseData) && responseData.length > 0
                      ? responseData.map((order, idx) => {
                          const storeName =
                            order?.storeName ||
                            order?.store_name ||
                            `Store #${order?.newOrder?.storeId || order?.newOrder?.store_id || idx + 1}`;
                          const items =
                            (order?.orderItems as Array<{
                              image?: string;
                              name?: string;
                              totalPrice?: number;
                            }>) || [];
                          const storeSubtotal = items.reduce(
                            (sum: number, it: { totalPrice?: number }) =>
                              sum + Number(it.totalPrice || 0),
                            0,
                          );
                          return (
                            <div key={idx} style={{ marginBottom: 14 }}>
                              <div className="cs-store-label">
                                🏪 {storeName}
                              </div>
                              <List
                                itemLayout="horizontal"
                                dataSource={items}
                                split={false}
                                renderItem={(
                                  item: {
                                    image?: string;
                                    name?: string;
                                    totalPrice?: number;
                                  },
                                  index: number,
                                ) => (
                                  <List.Item
                                    key={index}
                                    style={{ padding: "5px 0" }}
                                  >
                                    <List.Item.Meta
                                      avatar={
                                        <Avatar
                                          src={item?.image}
                                          size={36}
                                          shape="square"
                                          style={{
                                            borderRadius: 6,
                                            border: "1px solid #f0f0f0",
                                          }}
                                        />
                                      }
                                      title={
                                        <span style={{ fontSize: 13, color: "#1a1a1a" }}>
                                          {item?.name ?? ""}
                                        </span>
                                      }
                                      description={
                                        <span style={{ fontSize: 12, color: "#888" }}>
                                          {getCurrencySymbol(Settings?.currency)}{" "}
                                          {item?.totalPrice}
                                        </span>
                                      }
                                    />
                                  </List.Item>
                                )}
                              />
                              {responseData.length > 1 && (
                                <div className="cs-row-between cs-store-subtotal">
                                  <span>Subtotal for this seller</span>
                                  <span>
                                    {getCurrencySymbol(Settings?.currency)}{" "}
                                    {storeSubtotal.toFixed(2)}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })
                      : null}
                  </div>

                  {/* Totals */}
                  <div className="cs-card-section cs-totals">
                    <div className="cs-row-between cs-totals__line">
                      <span>Product Total</span>
                      <span>
                        {getCurrencySymbol(Settings?.currency)}{" "}
                        {Number(
                          Array.isArray(responseData)
                            ? responseData.reduce(
                                (acc: number, order: Order) =>
                                  acc + (Number(order?.newOrder?.total) || 0),
                                0,
                              )
                            : responseData?.[0]?.newOrder?.total || 0,
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="cs-row-between cs-totals__line">
                      <span>Discount</span>
                      <span>
                        -{getCurrencySymbol(Settings?.currency)}{" "}
                        {Number(
                          Array.isArray(responseData)
                            ? responseData.reduce(
                                (acc: number, order: Order) =>
                                  acc +
                                  (Number(order?.newOrder?.discount) || 0),
                                0,
                              )
                            : responseData?.[0]?.newOrder?.discount || 0,
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="cs-row-between cs-totals__line">
                      <span>Tax</span>
                      <span>
                        {getCurrencySymbol(Settings?.currency)}{" "}
                        {Number(
                          Array.isArray(responseData)
                            ? responseData.reduce(
                                (acc: number, order: Order) =>
                                  acc + (Number(order?.newOrder?.tax) || 0),
                                0,
                              )
                            : responseData?.[0]?.newOrder?.tax || 0,
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="cs-row-between cs-totals__line">
                      <span>
                        Delivery
                        {getActiveDeliveryPromo() && (
                          <span className="cs-promo-tag">(FREE - Promo)</span>
                        )}
                      </span>
                      <span>
                        {getActiveDeliveryPromo() ? (
                          <>
                            <span className="cs-strikethrough">
                              {getCurrencySymbol(Settings?.currency)}{" "}
                              {Number(
                                Array.isArray(responseData)
                                  ? responseData.reduce(
                                      (acc: number, order: Order) =>
                                        acc +
                                        (Number(
                                          order?.newOrder?.deliveryCharge,
                                        ) ||
                                          Number(order?.deliveryCharge) ||
                                          0),
                                      0,
                                    )
                                  : responseData?.[0]?.newOrder
                                      ?.deliveryCharge ||
                                      responseData?.[0]?.deliveryCharge ||
                                      0,
                              ).toFixed(2)}
                            </span>
                            <span className="cs-free-tag">FREE</span>
                          </>
                        ) : (
                          <>
                            {getCurrencySymbol(Settings?.currency)}{" "}
                            {Number(
                              Array.isArray(responseData)
                                ? responseData.reduce(
                                    (acc: number, order: Order) =>
                                      acc +
                                      (Number(
                                        order?.newOrder?.deliveryCharge,
                                      ) ||
                                        Number(order?.deliveryCharge) ||
                                        0),
                                    0,
                                  )
                                : responseData?.[0]?.newOrder?.deliveryCharge ||
                                    responseData?.[0]?.deliveryCharge ||
                                    0,
                            ).toFixed(2)}
                          </>
                        )}
                      </span>
                    </div>
                    <div className="cs-row-between cs-totals__grand">
                      <span>Total</span>
                      <span>
                        {getCurrencySymbol(Settings?.currency)}{" "}
                        {(() => {
                          const grandTotal = Number(
                            Array.isArray(responseData)
                              ? responseData.reduce(
                                  (acc: number, order: Order) =>
                                    acc +
                                    (Number(order?.newOrder?.grandTotal) || 0),
                                  0,
                                )
                              : responseData?.[0]?.newOrder?.grandTotal || 0,
                          );
                          if (getActiveDeliveryPromo()) {
                            const deliveryCharges = Number(
                              Array.isArray(responseData)
                                ? responseData.reduce(
                                    (acc: number, order: Order) =>
                                      acc +
                                      (Number(
                                        order?.newOrder?.deliveryCharge,
                                      ) ||
                                        Number(order?.deliveryCharge) ||
                                        0),
                                    0,
                                  )
                                : responseData?.[0]?.newOrder?.deliveryCharge ||
                                    responseData?.[0]?.deliveryCharge ||
                                    0,
                            );
                            return (grandTotal - deliveryCharges).toFixed(2);
                          }
                          return grandTotal.toFixed(2);
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          ) : (
            /* ── ORDER FAILED ── */
            <div className="cs-center-box">
              <div className="cs-icon-ring cs-icon-ring--red">
                <VscError size={36} color="#ff4d4f" />
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#1a1a1a" }}>
                Order Failed
              </div>
              <div style={{ fontSize: 14, color: "#666", maxWidth: 360, lineHeight: 1.7, textAlign: "center" }}>
                We were unable to complete your order. Please try again.
              </div>
              <div className="cs-error-notice">
                Any amount debited from your account will be refunded within 24 hours.
              </div>
              <Button
                size="large"
                onClick={() => router.replace("/cart")}
                style={{ marginTop: 8, borderRadius: 10, minWidth: 140 }}
              >
                Go Back to Cart
              </Button>
            </div>
          )
        ) : (
          /* ── PAYMENT FAILED ── */
          <div className="cs-center-box">
            <div className="cs-icon-ring cs-icon-ring--red">
              <VscError size={36} color="#ff4d4f" />
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#1a1a1a" }}>
              Payment Failed
            </div>
            <div style={{ fontSize: 14, color: "#666", maxWidth: 360, lineHeight: 1.7, textAlign: "center" }}>
              We were unable to process your payment. Please try again.
            </div>
            <div className="cs-error-notice">
              Any amount debited from your account will be refunded within 24 hours.
            </div>
            <Button
              size="large"
              onClick={() => router.replace("/cart")}
              style={{ marginTop: 8, borderRadius: 10, minWidth: 140 }}
            >
              Go Back to Cart
            </Button>
          </div>
        )}
      </Container>

      <PostOrderReviewModal
        open={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        products={reviewProducts}
      />
    </div>
  );
}
export default Checkout;
