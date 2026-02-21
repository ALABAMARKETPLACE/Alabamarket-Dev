"use client";


// GuestOrderPayload — disabled (guest order flow commented out)
// interface GuestOrderPayload {
//   guest_info: { email: string; first_name: string; last_name: string; phone: string; country_code: string; };
//   cart_items: GuestCartItem[];
//   delivery_address: { full_name: string; phone_no: string; country_code: string; full_address: string;
//     city: string; state: string; state_id: number; country: string; country_id: number;
//     landmark?: string; address_type?: string; };
//   delivery: { delivery_token: string; delivery_charge: number; total_weight: number; estimated_delivery_days?: number | null; };
//   payment: { payment_reference: string; payment_method: string; transaction_reference: string;
//     amount_paid: number; payment_status: string; paid_at: string; };
//   order_summary: { subtotal: number; delivery_fee: number; tax: number; discount: number; total: number; };
//   metadata: { order_notes?: string; source?: string; device_id?: string; preferred_delivery_time?: string | null; };
//   is_multi_seller: boolean;
// }

import { useCallback, useEffect, useState } from "react";

import "./styles.scss";
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
  }, []);

  const PlaceOrder = useCallback(async () => {
    try {
      setOrderCreated(true); // Prevent multiple executions

      let finalOrderData;
      let paystackRef: string | null = null;

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

        // Resolve the real Paystack reference from the URL — used ONLY for payment verification.
        // The real ORDER_xxx ref is what Paystack knows about and must be used to confirm the charge.
        const realPaystackRef =
          searchParams.get("reference")?.trim() ||
          searchParams.get("trxref")?.trim() ||
          searchParams.get("ref")?.trim() ||
          localStorage.getItem("paystack_payment_reference")?.trim() ||
          null;
        if (!realPaystackRef) {
          throw new Error("Payment reference not found. Please try again.");
        }
        // paystackRef is kept as the real ref for display in error messages only.
        paystackRef = realPaystackRef;

        console.log("Verifying payment with real Paystack ref:", realPaystackRef);

        // Load stored order data
        const storedOrderData = localStorage.getItem("paystack_order_data");
        const orderData = storedOrderData ? JSON.parse(storedOrderData) : null;

        // Verify using the REAL Paystack reference so the actual charge is confirmed.
        const verificationResponse: Record<string, unknown> | null =
          await POST(API.PAYSTACK_VERIFY, { reference: realPaystackRef });

        console.log("Payment verification response:", verificationResponse);

        if (verificationResponse) {
          const vObj = (
            verificationResponse as { data?: Record<string, unknown> }
          )?.data
            ? ((verificationResponse as { data: Record<string, unknown> })
                .data as Record<string, unknown>)
            : (verificationResponse as Record<string, unknown>);
          const vStatus = String(vObj?.status ?? "");
          if (!vStatus) {
            throw new Error(
              (verificationResponse as { message?: string })?.message ||
                "Payment verification failed. Please try again.",
            );
          }
        }

        // Payment verified — build only what the /order endpoint needs
        const storedCart = orderData?.order_data?.cart ?? Checkout?.cart ?? [];
        const storedAddress = orderData?.order_data?.address ?? Checkout?.address ?? {};
        const storedToken = orderData?.order_data?.charges?.token ?? Checkout?.charges?.token ?? "";

        finalOrderData = {
          cart: storedCart,
          address: storedAddress,
          charges: { token: storedToken },
          payment: {
            type: "pay-online",
            ref: realPaystackRef,
          },
        };
      } else {
        // Unknown route
        throw new Error("Invalid checkout route. Please try again.");
      }

      console.log("Final order data:", finalOrderData);

      // Validate cart
      if (
        !finalOrderData?.cart ||
        !Array.isArray(finalOrderData.cart) ||
        finalOrderData.cart.length === 0
      ) {
        throw new Error(
          "Cart is empty. Unable to process order. Please start over.",
        );
      }

      // Validate address
      if (!finalOrderData?.address?.id) {
        throw new Error(
          "Delivery address is invalid. Please go back and select a valid address.",
        );
      }

      // Validate delivery token
      if (!finalOrderData?.charges?.token) {
        throw new Error(
          "Delivery charge calculation failed. Please go back and recalculate.",
        );
      }

      // Build exact payload per API spec
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cleanPayload: Record<string, unknown> = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cart: (finalOrderData.cart as any[]).map((item: any) => ({
          id: Number(item?.id || 0),
          productId: Number(item?.productId || 0),
          variantId: item?.variantId ? Number(item.variantId) : null,
          quantity: Number(item?.quantity || 0),
        })),
        address: { id: Number(finalOrderData.address.id) },
        payment: {
          type: finalOrderData?.payment?.type || "pay-online",
          ...(finalOrderData?.payment?.ref
            ? { ref: String(finalOrderData.payment.ref) }
            : {}),
        },
        charges: { token: String(finalOrderData?.charges?.token || "") },
      };

      console.log("========== ORDER PAYLOAD ==========");
      console.log(JSON.stringify(cleanPayload, null, 2));
      console.log("===================================");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await POST(API.ORDER, cleanPayload);

      /* ---------- GUEST ORDER FLOW (disabled) ----------
      if (isGuestOrder) {
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
                    (asRecord.product as Record<string, unknown> | undefined)?.id,
                    (asRecord.product as Record<string, unknown> | undefined)?.pid,
                    asRecord.product_id as number | undefined,
                  ];
                  const toNumber = (x: unknown): number | null => {
                    const n = typeof x === "string" ? parseInt(x, 10) : (x as number | null);
                    return Number.isFinite(n as number) && (n as number) > 0 ? (n as number) : null;
                  };
                  const product_id =
                    toNumber(candidates[0]) ?? toNumber(candidates[1]) ??
                    toNumber(candidates[2]) ?? toNumber(candidates[3]) ??
                    toNumber(candidates[4]) ?? toNumber(candidates[5]) ?? 0;
                  const product_name =
                    (item as CheckoutCartItem)?.name ||
                    ((asRecord.product as Record<string, unknown> | undefined)?.name as string | undefined) || "";
                  const variant_id_candidate =
                    (item as CheckoutCartItem)?.variantId ??
                    ((asRecord.productVariant as Record<string, unknown> | undefined)?.id as number | undefined) ?? null;
                  const variant_id = variant_id_candidate != null ? (toNumber(variant_id_candidate) ?? null) : null;
                  const store_id =
                    toNumber((item as CheckoutCartItem)?.store_id) ??
                    toNumber((item as { storeId?: number })?.storeId) ??
                    toNumber((asRecord.product as Record<string, unknown> | undefined)?.store_id) ?? 0;
                  const unit_price =
                    typeof (asRecord as { price?: unknown })?.price === "number"
                      ? (asRecord as { price?: number }).price
                      : Number((item as { unit_price?: number })?.unit_price || 0);
                  const total_price =
                    typeof (asRecord as { totalPrice?: unknown })?.totalPrice === "number"
                      ? (asRecord as { totalPrice?: number }).totalPrice
                      : Number((item as { total_price?: number })?.total_price || 0);
                  const image =
                    ((asRecord.product as Record<string, unknown> | undefined)?.image as string | undefined) ||
                    ((asRecord as { image?: string })?.image as string | undefined) || null;
                  return { product_id, product_name, variant_id, variant_name: (item as CheckoutCartItem)?.combination,
                    quantity: Number((item as CheckoutCartItem)?.quantity || 0), store_id,
                    weight: Number((item as CheckoutCartItem)?.weight || 0), unit_price, total_price, image };
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
              ? finalOrderData.cart.reduce((sum: number, item: CheckoutCartItem) => sum + (item.weight || 0), 0)
              : 0,
            estimated_delivery_days:
              ((finalOrderData?.charges as Record<string, unknown>)?.["estimated_days"] as number | undefined) ?? null,
          },
          payment: {
            payment_reference: finalOrderData?.payment?.ref || "",
            payment_method: finalOrderData?.payment?.type || "paystack",
            transaction_reference:
              finalOrderData?.payment?.transaction_reference || finalOrderData?.payment?.ref || "",
            amount_paid: finalOrderData?.payment?.amount || 0,
            payment_status: finalOrderData?.payment?.status || "success",
            paid_at: finalOrderData?.payment?.verified_at || new Date().toISOString(),
          },
          order_summary: {
            subtotal: Array.isArray(finalOrderData?.cart)
              ? finalOrderData.cart.reduce((sum: number, item: CheckoutCartItem) => sum + (item.totalPrice || 0), 0)
              : 0,
            delivery_fee: finalOrderData?.charges?.totalCharge || 0,
            tax: 0,
            discount: 0,
            total:
              (Array.isArray(finalOrderData?.cart)
                ? finalOrderData.cart.reduce((sum: number, item: CheckoutCartItem) => sum + (item.totalPrice || 0), 0)
                : 0) + (finalOrderData?.charges?.totalCharge || 0),
          },
          metadata: {
            order_notes: finalOrderData?.notes || "",
            preferred_delivery_time:
              ((finalOrderData as Record<string, unknown>)?.["preferred_delivery_time"] as string | undefined) || null,
            source: finalOrderData?.source || "web_app",
            device_id: finalOrderData?.device_id || "",
          },
          is_multi_seller: isMultiSeller,
        };

        const invalidItems =
          Array.isArray(guestOrderPayload.cart_items) &&
          guestOrderPayload.cart_items.filter((ci) => !ci.product_id || Number(ci.product_id) <= 0);
        if (Array.isArray(invalidItems) && invalidItems.length > 0) {
          console.error("Invalid guest cart items:", invalidItems);
          Notifications["error"]({
            message: "Order Validation Failed",
            description: "Some cart items are missing product IDs. Please remove and re-add those items, then try again.",
          });
          setIsLoading(false);
          return;
        }

        console.log("[Order] POST (guest)", API.ORDER_GUEST, guestOrderPayload);
        response = await POST(API.ORDER_GUEST, guestOrderPayload);
      } else {
        console.log("[Order] POST (auth)", API.ORDER, finalOrderData);
        response = await POST(API.ORDER, finalOrderData);
      }
      --------- END GUEST ORDER FLOW ---------- */
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
          }

          // Detect "already used reference" — this is a backend multi-seller bug where
          // the backend marks payment.ref as used after sub-order 1, then rejects
          // sub-order 2 with the same ref. The backend must allow the same payment.ref
          // across all sub-orders of the same multi-seller checkout (see docs/order-duplication-fix.md).
          const isAlreadyUsedRef =
            typeof failureReason === "string" &&
            failureReason.toLowerCase().includes("already used");

          Notifications["error"]({
            message: "Order Processing Failed",
            description: isAlreadyUsedRef
              ? `Your payment was received but the order could not be created (duplicate reference). Please contact support and quote your payment reference: ${paystackRef}.`
              : `Order processing failed: ${failureReason}. Please try again or contact support.`,
            duration: 0, // keep visible until user dismisses
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

        // Clean up order-creation flags so future checkouts start fresh
        localStorage.removeItem("order_creation_completed");
        localStorage.removeItem("last_order_response");

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
                      {(() => {
                        // Prefer explicit payment type, fallback to logic
                        const paymentType =
                          responseData?.[0]?.orderPayment?.paymentType;
                        if (
                          paymentType &&
                          paymentType.toLowerCase().includes("cash")
                        ) {
                          // If promo disables COD, show Online Payment
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
                        // Fallback: if not COD, show Online Payment
                        return "Online Payment";
                      })()}{" "}
                      Amount: {getCurrencySymbol(Settings?.currency)}{" "}
                      {(() => {
                        // Exclude delivery price from amount if promo is active
                        const promo = getActiveDeliveryPromo();
                        // Sum orderPayment.amount across all sub-orders (multi-seller
                        // orders split the payment across store records, so [0] alone
                        // only captures one store's portion).
                        let amount = Number(
                          Array.isArray(responseData)
                            ? responseData.reduce(
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                (acc: number, order: any) =>
                                  acc +
                                  (Number(order?.orderPayment?.amount) || 0),
                                0,
                              )
                            : responseData?.[0]?.orderPayment?.amount || 0,
                        );
                        if (promo) {
                          // Subtract delivery charge if present
                          const delivery = Number(
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
                          amount = amount - delivery;
                        }
                        return amount.toFixed(2);
                      })()}
                    </div>
                  </div>
                  <div className="checkout-txt3">ORDER SUMMARY</div>
                  <div style={{ margin: 10 }}>
                    {/* Group by each order in responseData (each is a seller/store) */}
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
                            <div
                              key={idx}
                              style={{
                                marginBottom: 18,
                                borderBottom: "1px solid #eee",
                                paddingBottom: 10,
                              }}
                            >
                              <div
                                style={{
                                  fontWeight: 600,
                                  fontSize: 15,
                                  marginBottom: 6,
                                  color: "#1a237e",
                                }}
                              >
                                🏪 {storeName}
                              </div>
                              <List
                                itemLayout="horizontal"
                                dataSource={items}
                                renderItem={(
                                  item: {
                                    image?: string;
                                    name?: string;
                                    totalPrice?: number;
                                  },
                                  index: number,
                                ) => (
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
                                      description={
                                        <div>Total: {item?.totalPrice}</div>
                                      }
                                    />
                                  </List.Item>
                                )}
                              />
                              <div
                                className="checkout-row"
                                style={{ marginTop: 6 }}
                              >
                                <div>Subtotal for this seller</div>
                                <div style={{ flex: 1 }} />
                                <div>
                                  {getCurrencySymbol(Settings?.currency)}{" "}
                                  {storeSubtotal.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      : null}
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
