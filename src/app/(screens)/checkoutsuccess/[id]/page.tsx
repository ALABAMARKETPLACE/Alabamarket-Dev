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
import { useSelector, useDispatch } from "react-redux";
import { VscError } from "react-icons/vsc";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { Col, Container, Row } from "react-bootstrap";
import { Avatar, Button, List, Spin, notification } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import { clearCheckout } from "@/redux/slice/checkoutSlice";
import { GET, POST, DELETE, PUBLIC_POST } from "@/util/apicall";
import API from "@/config/API";
import { storeCart } from "@/redux/slice/cartSlice";
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
  const [orderItems, setOrderItems] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [responseData, setResponseData] = useState<any>({});
  const [orderCreated, setOrderCreated] = useState(false);

  // Get route parameter to determine payment method
  const routeId = params?.id;
  const isCOD = routeId === "1";
  const isPaystack = routeId === "2";

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
    setOrderItems(array);
  }, []);

  const loadCartItems = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const userId = (User as any)?.data?.id || (User as any)?.id;
      if (userId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cartItems: any = await GET(API.CART_GET_ALL);
        if (cartItems.status) {
          dispatch(storeCart(cartItems.data));
          return;
        } else {
        }
      }
    } catch {
      return;
    }
  }, [User, dispatch]);

  const PlaceOrder = useCallback(async () => {
    try {
      setOrderCreated(true); // Prevent multiple executions

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

        const paymentRef =
          searchParams.get("reference") ||
          searchParams.get("ref") ||
          localStorage.getItem("paystack_payment_reference");

        console.log("Paystack payment reference:", paymentRef);

        if (!paymentRef || paymentRef === "null") {
          throw new Error("Payment reference not found. Please try again.");
        }

        // Load stored order data (for other order info, not for token)
        const storedOrderData = localStorage.getItem("paystack_order_data");
        const orderData = storedOrderData ? JSON.parse(storedOrderData) : null;

        // Verify payment with backend
        console.log("Verifying payment with reference:", paymentRef);
        // Determine if guest and derive available delivery token for authorization
        const isGuest =
          !(User && typeof (User as { id?: unknown })?.id === "number") ||
          Boolean(orderData?.guest_email) ||
          Boolean(Checkout?.address?.is_guest);
        // No token required for verify-guest

        // Robust verification with fallbacks for guest
        let verificationResponse: Record<string, unknown> | null = null;
        let vStatus = "";
        let vAmount = 0;
        let vGatewayResponse: string | null = null;
        const skipVerify = false;
        try {
          if (isGuest) {
            // Guest users: use only /paystack/verify-guest
            verificationResponse = await PUBLIC_POST(
              API.PAYSTACK_VERIFY_GUEST,
              {
                reference: paymentRef,
                guest_email:
                  orderData?.guest_email ||
                  Checkout?.address?.email ||
                  Checkout?.address?.guest_email ||
                  "",
              },
            );
          } else {
            // Authenticated users: use only /paystack/verify
            verificationResponse = await POST(API.PAYSTACK_VERIFY, {
              reference: paymentRef,
            });
          }
        } catch (e: unknown) {
          throw e;
        }

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
            ref: paymentRef,
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

        // Ensure payment info includes verification data
        finalOrderData.payment = {
          ...finalOrderData.payment,
          ref: paymentRef,
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

      // Normalize cart items to ensure store_id is present for multi-seller order creation
      if (Array.isArray(finalOrderData?.cart)) {
        finalOrderData.cart = finalOrderData.cart.map(
          (item: CheckoutCartItem) => {
            // Extract store_id from various possible field names
            const store_id =
              (item as CheckoutCartItem)?.store_id ||
              (item as { storeId?: number })?.storeId ||
              (item as { product?: { store_id?: number; storeId?: number } })
                ?.product?.store_id ||
              (item as { product?: { store_id?: number; storeId?: number } })
                ?.product?.storeId ||
              null;
            // Remove storeId from the item if present
            const rest = { ...item };
            delete (rest as { storeId?: unknown }).storeId;
            return {
              ...rest,
              store_id,
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
      if (
        !finalOrderData?.charges ||
        (!finalOrderData.charges.token && !isGuestToken)
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

      // Determine if this is a multi-seller order (applies to both guest and authenticated)
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

        console.log("Guest order payload:", guestOrderPayload);
        response = await PUBLIC_POST(
          API.ORDER_GUEST,
          guestOrderPayload as unknown as Record<string, unknown>,
          null,
          {
            headers: finalOrderData?.charges?.token
              ? {
                  Authorization: `Bearer ${String(
                    finalOrderData?.charges?.token,
                  )}`,
                }
              : undefined,
          },
        );
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

        // Handle split orders: Check for any failed orders
        if (Array.isArray(orders)) {
          orders.forEach((order: Order) => {
            if (
              order?.newOrder?.status === "failed" ||
              order?.status === "failed"
            ) {
              const failureReason =
                order?.newOrder?.reason || order?.reason || "Unknown error";
              const remark = order?.remark || order?.orderStatus?.remark || ""; // Check top-level remark too

              // Check if failure is due to reference already used (idempotency issue)
              const isReferenceError =
                remark.includes("Already Used") ||
                failureReason.includes("Already Used") ||
                remark.includes("already used");

              if (isReferenceError) {
                console.log(
                  "Order verification: Reference already used, treating as successful (idempotency check).",
                );
                // Fix status
                if (order?.newOrder?.status === "failed") {
                  order.newOrder.status = "Confirmed";
                }
                if (order?.status === "failed") {
                  order.status = "Confirmed";
                }
              } else {
                console.warn(
                  "Order part marked as failed but proceeding to show available items:",
                  order,
                );
                // We do NOT return here anymore. We try to show what succeeded.
                // But we might want to notify the user if ALL failed.
              }
            }
          });
        }

        // Re-check if ALL orders are still failed after our fix attempt
        const allFailed =
          Array.isArray(orders) &&
          orders.length > 0 &&
          orders.every(
            (order: Order) =>
              order?.newOrder?.status === "failed" ||
              order?.status === "failed",
          );

        if (allFailed) {
          const firstFailed = orders[0];
          const failureReason =
            firstFailed?.newOrder?.reason ||
            firstFailed?.reason ||
            "Unknown error";

          Notifications["error"]({
            message: "Order Processing Failed",
            description: `Order processing failed: ${failureReason}. Please contact support.`,
          });
          setPaymentStatus(true);
          setOrderStatus(false);
          setIsLoading(false);
          return;
        }

        // If at least one success (or fixed), proceed.
        // If some failed but not all, we show success for the valid ones.
        // (Optionally we could warn about the partial failure, but for now let's prioritize showing the success)

        if (
          Array.isArray(orders) &&
          orders.some(
            (o: Order) =>
              o?.newOrder?.status === "Confirmed" || o?.status === "Confirmed",
          )
        ) {
          Notifications["success"]({
            message: "Order Confirmed",
            description: "Your order has been successfully placed.",
          });
        }

        getOrderItems(response?.data);
        setResponseData(response?.data);

        // Store order response for duplicate prevention
        localStorage.setItem(
          "last_order_response",
          JSON.stringify(response?.data),
        );
        localStorage.setItem("order_creation_completed", "true");

        setOrderStatus(true);

        // Track Purchase
        if (response?.data && Array.isArray(response.data)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const allItems: any[] = [];
          let totalValue = 0;
          let totalShipping = 0;
          let totalTax = 0;
          const firstOrder = response.data[0];

          response.data.forEach((order: Order) => {
            // Check if order is valid/confirmed before tracking?
            // Even if failed, if we fixed it or it's partial, we might want to track?
            // Let's track everything that is in the response to be consistent with UI.
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
        }

        // Clear cart from backend and redux
        try {
          await DELETE(API.CART_CLEAR_ALL);
          dispatch(storeCart([]));
        } catch (e) {
          console.error("Failed to clear cart", e);
        }

        dispatch(clearCheckout());
        loadCartItems();
        setPaymentStatus(true);
      } else {
        Notifications["error"]({
          message: response?.message ?? "Order creation failed",
          description: response?.description || "Please try again",
        });
        setPaymentStatus(true);
        setOrderStatus(false);
      }

      setIsLoading(false);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setPaymentStatus(true);
      setOrderStatus(false);
      setIsLoading(false);
      // Don't reset orderCreated to false - it causes infinite re-render loop
      // User can manually retry by clicking a button or refreshing

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
    loadCartItems,
    searchParams,
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
      <br />
      <Container fluid style={{ minHeight: "80vh" }}>
        {isLoading ? (
          <div className="checkout-box">
            <div className="checkout-txt1">Your Order Processing</div>
            <div className="checkout-txt2">Please do not click back button</div>
            <br />
            <Spin indicator={antIcon} />
          </div>
        ) : paymentStatus ? (
          orderStatus ? (
            <Row>
              <Col sm={8} xs={12}>
                <div className="checkout-box2">
                  <div>
                    <div>
                      <IoIosCheckmarkCircleOutline size={60} color="#15ad4c" />
                    </div>
                    <div className="checkout-txt2" style={{ color: "#15ad4c" }}>
                      Thank You
                    </div>
                    <div className="checkout-txt1">
                      Your Order is Placed Successfully
                    </div>
                    <div className="checkout-txt2">
                      We will be send you an email confirmation to your
                      registered email shortly
                    </div>
                    <br />
                    <br />
                    <Button
                      type="link"
                      onClick={() => router.replace("/user/orders")}
                    >
                      View my Orders.
                    </Button>
                  </div>
                </div>
                <br />
              </Col>
              <Col sm={4} xs={12}>
                <div className="checkout-box3">
                  <div>
                    <div>
                      <div className="checkout-txt3">
                        <div>Order Status : </div>
                        <div style={{ color: "green" }}>
                          {Array.isArray(responseData) &&
                          responseData.some(
                            (o: Order) =>
                              o?.newOrder?.status === "Confirmed" ||
                              o?.status === "Confirmed",
                          )
                            ? "Confirmed"
                            : responseData?.[0]?.newOrder?.status ||
                              "Confirmed"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="checkout-txt3">DELIVERY ADDRESS</div>

                    <div className="checkout-txt4">
                      {responseData?.[0]?.address?.fullAddress ?? ""},
                      {responseData?.[0]?.address?.pin_code ?? ""},
                      {responseData?.[0]?.address?.state ?? ""},
                      {responseData?.[0]?.address?.street ?? ""},<br />
                      {responseData?.[0]?.address?.alt_phone ?? ""}
                    </div>
                  </div>
                  <div>
                    <div className="checkout-txt3">PAYMENT DETAILS</div>
                    <div className="checkout-txt4">
                      Payment Type:{" "}
                      {responseData?.[0]?.orderPayment?.paymentType ?? ""}{" "}
                      Amount: {getCurrencySymbol(Settings?.currency)}{" "}
                      {(() => {
                        const paymentAmount = Number(
                          responseData?.[0]?.orderPayment?.amount || 0,
                        );
                        // If promo is active, subtract delivery charges
                        if (getActiveDeliveryPromo()) {
                          const deliveryCharges = Number(
                            Array.isArray(responseData)
                              ? responseData.reduce(
                                  (acc: number, order: Order) =>
                                    acc +
                                    (Number(order?.newOrder?.deliveryCharge) ||
                                      Number(order?.deliveryCharge) ||
                                      0),
                                  0,
                                )
                              : responseData?.[0]?.newOrder?.deliveryCharge ||
                                  responseData?.[0]?.deliveryCharge ||
                                  0,
                          );
                          return (paymentAmount - deliveryCharges).toFixed(2);
                        }
                        return paymentAmount.toFixed(2);
                      })()}
                    </div>
                  </div>
                  <div className="checkout-txt3">ORDER SUMMARY</div>
                  <div style={{ margin: 10 }}>
                    <List
                      itemLayout="horizontal"
                      dataSource={orderItems}
                      renderItem={(item, index) => (
                        <List.Item key={index}>
                          <List.Item.Meta
                            avatar={
                              <Avatar
                                src={item?.image}
                                size={40}
                                shape="square"
                              />
                            }
                            title={item?.name ?? ""}
                            description={<div>Total: {item?.totalPrice}</div>}
                          />
                        </List.Item>
                      )}
                    />
                    <br />
                    <div className="checkout-row">
                      <div>Total Product Price</div>
                      <div>
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
                      </div>
                    </div>
                    <div className="checkout-row">
                      <div>Discount</div>
                      <div>
                        {getCurrencySymbol(Settings?.currency)}{" "}
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
                      </div>
                    </div>
                    <div className="checkout-row">
                      <div>Tax</div>
                      <div>
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
                      </div>
                    </div>
                    <div className="checkout-row">
                      <div>
                        Delivery Charges
                        {getActiveDeliveryPromo() && (
                          <span
                            style={{
                              color: "#15ad4c",
                              fontSize: "12px",
                              marginLeft: "8px",
                            }}
                          >
                            (FREE - Promo Applied)
                          </span>
                        )}
                      </div>
                      <div>
                        {getActiveDeliveryPromo() ? (
                          <>
                            <span
                              style={{
                                textDecoration: "line-through",
                                color: "#999",
                                marginRight: "8px",
                              }}
                            >
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
                            <span style={{ color: "#15ad4c", fontWeight: 600 }}>
                              FREE
                            </span>
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
                      </div>
                    </div>
                    <hr />
                    <div className="checkout-row">
                      <div>Total</div>
                      <div>
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
                          // If promo is active, subtract delivery charges from total
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
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          ) : (
            <div className="checkout-box4">
              <div className="checkout-txt1">Order Failed.</div>
              <div className="checkout-txt2">
                We are unable to complete your order. Please try again
              </div>
              <div className="checkout-txt2" style={{ color: "red" }}>
                Any Amount debited from your account will be refunded within 24
                hours
              </div>
              <br />
              <VscError size={50} color="red" />
              <br />
              <Button onClick={() => router.replace("/cart")}>GO BACK</Button>
            </div>
          )
        ) : (
          <div className="checkout-box4">
            <div className="checkout-txt1">Payment Faild.</div>
            <div className="checkout-txt2">
              We are unable to complete your order due to payment failure.
              Please try again
            </div>
            <div className="checkout-txt2" style={{ color: "red" }}>
              Any Amount debited from your account will be refunded within 24
              hours
            </div>
            <br />
            <VscError size={50} color="red" />
            <br />
            <Button onClick={() => router.replace("/cart")}>GO BACK</Button>
          </div>
        )}
      </Container>

      <br />
      <br />
    </div>
  );
}
export default Checkout;
