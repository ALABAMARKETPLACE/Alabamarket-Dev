"use client";
import { useCallback, useEffect, useState } from "react";
import "../../(user)/cart/styles.scss";
import { Container } from "react-bootstrap";
import { useSelector } from "react-redux";
import { notification } from "antd";

import NewAddressBox from "./_components/newAddressBox";
import PaymentBox from "./_components/paymentBox";
import SummaryCard from "./_components/summaryCard";

import { POST, PUBLIC_POST } from "@/util/apicall";
import API from "@/config/API";
import { useSession } from "next-auth/react";
import { useAppSelector } from "@/redux/hooks";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import { formatGAItem, trackBeginCheckout } from "@/utils/analytics";
import { getGuestInfo } from "./_components/guestAddressForm";

enum PaymentTypeEnum {
  Paystack = "paystack",
}

function Checkout() {
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
  const [isLoading, setIsLoading] = useState<any>(false);
  const [deliveryToken, setDeliveryToken] = useState<string>("");

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
    localStorage.removeItem("order_payload");
    localStorage.removeItem("guest_order_payload");

    // Guest checkout disabled
    // if (!isAuthenticated) {
    //   const savedData = getGuestAddress();
    //   if (savedData?.email) {
    //     setGuestEmail(savedData.email);
    //   }
    // }
  }, [isAuthenticated]);

  // Do NOT mutate Checkout.address directly. Instead, always create a new object with email when needed.

  useEffect(() => {
    if (Checkout?.Checkout && Checkout.Checkout.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const gaItems = Checkout.Checkout.map((item: any) =>
        formatGAItem(item, null, item.quantity),
      );
      trackBeginCheckout(gaItems, total, Settings?.currency);
    }
  }, [Checkout?.Checkout, total, Settings?.currency]);

  const [currentStep, setCurrentStep] = useState(1);
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

        // Build payloads per auth state
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let response: any;
        const deliveryObj = {
          cart: calculationCart,
          address: addressData,
        };
        if (isAuthenticated) {
          response = await POST(API.NEW_CALCULATE_DELIVERY_CHARGE, deliveryObj);
        } else {
          response = await PUBLIC_POST(API.PUBLIC_CALCULATE_DELIVERY_CHARGE, deliveryObj);
        }

        console.log("Delivery response:", response);

        if (response?.status) {
          const deliveryToken = response?.token ?? "";
          const delivery = Number(response?.details?.totalCharge ?? 0);
          const discountVal = Number(response?.details?.discount ?? 0);
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
          // No delivery charge configured for this state — allow with ₦0 delivery
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

  const PlaceOrder = async () => {
    if (!Checkout?.address?.id) {
      notificationApi.error({
        message: "Please choose a delivery address to place an order",
      });
      return;
    }

    try {
      setIsLoading(true);

      // ── AUTHENTICATED FLOW ──
      if (isAuthenticated) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cart = (Checkout?.Checkout ?? []).map((item: any) => ({
          id: Number(item?.id ?? 0),
          productId: Number(item?.productId ?? item?.product_id ?? 0),
          variantId: item?.variantId ? Number(item.variantId) : null,
          storeId: Number(item?.storeId ?? item?.store_id ?? 0),
          quantity: Number(item?.quantity ?? 0),
        }));

        const payload = {
          cart,
          payment: {
            type: PaymentTypeEnum.Paystack,
            callback_url: `${window.location.origin}/checkoutsuccess/2`,
          },
          address: { id: Number(Checkout.address.id) },
          charges: { token: deliveryToken ?? "" },
        };

        const response = await POST(API.ORDER, payload);
        const authUrl =
          response?.data?.authorization_url ||
          response?.authorization_url ||
          null;

        if (authUrl) {
          localStorage.setItem("order_payload", JSON.stringify({
            cart,
            address: { id: Number(Checkout.address.id) },
            charges: { token: deliveryToken ?? "" },
          }));
          window.location.href = authUrl;
        } else {
          throw new Error("Payment initialization failed. Please try again or contact support.");
        }
        return;
      }

      // ── GUEST FLOW ──
      const guestInfo = getGuestInfo();
      if (!guestInfo?.email) {
        notificationApi.error({ message: "Please complete your delivery details to continue." });
        setIsLoading(false);
        return;
      }

      const addr = Checkout.address;

      // Top-level cart_items: snake_case format required by paystack/initialize-guest
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const topLevelCartItems = (Checkout?.Checkout ?? []).map((item: any) => ({
        product_id: Number(item?.productId) || Number(item?.product_id) || Number(item?.product?.id) || 0,
        store_id: Number(item?.storeId ?? item?.store_id ?? 0),
        variant_id: item?.variantId ? Number(item.variantId) : item?.variant_id ? Number(item.variant_id) : null,
        quantity: Number(item?.quantity ?? 0),
        unit_price: Number(item?.buyPrice ?? item?.price ?? 0),
      }));

      // order_payload cart_items: detailed snake_case format for webhook order creation
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const orderPayloadCartItems = (Checkout?.Checkout ?? []).map((item: any) => {
        const productId =
          Number(item?.productId) ||
          Number(item?.product_id) ||
          Number(item?.product?.id) ||
          0;
        const variantId =
          item?.variantId ? Number(item.variantId) :
          item?.variant_id ? Number(item.variant_id) : null;
        return {
          product_id: productId,
          variant_id: variantId,
          store_id: Number(item?.storeId ?? item?.store_id ?? 0),
          product_name: item?.name ?? "",
          variant_name: Array.isArray(item?.combination)
            ? item.combination.map((c: { value: string }) => c.value).join(", ")
            : "",
          quantity: Number(item?.quantity ?? 0),
          unit_price: Number(item?.buyPrice ?? item?.price ?? 0),
          total_price: Number(item?.totalPrice ?? 0),
          weight: Number(item?.weight ?? 1),
          image: item?.image ?? "",
        };
      });

      const totalWeight = orderPayloadCartItems.reduce(
        (sum: number, it: { weight: number; quantity: number }) => sum + it.weight * it.quantity,
        0,
      );

      const guestInfoPayload = {
        email: guestInfo.email,
        first_name: guestInfo.first_name,
        last_name: guestInfo.last_name,
        phone: guestInfo.phone,
        country_code: guestInfo.country_code || "+234",
      };

      const deliveryAddress = {
        id: String(addr?.id ?? ""),
        full_name: addr?.full_name ?? "",
        phone_no: addr?.phone_no ?? "",
        country_code: addr?.country_code ?? "+234",
        full_address: addr?.full_address ?? addr?.address ?? "",
        city: addr?.lagos_city ?? addr?.city ?? "",
        state: addr?.stateDetails?.name ?? addr?.state ?? "",
        state_id: Number(addr?.state_id ?? addr?.stateDetails?.id ?? 0),
        country: addr?.countryDetails?.country_name ?? addr?.country ?? "Nigeria",
        country_id: Number(addr?.country_id ?? addr?.countryDetails?.id ?? 0),
        landmark: addr?.landmark ?? "",
        address_type: addr?.address_type ?? "Home",
      };

      const guestPayload = {
        guest_info: guestInfoPayload,
        cart_items: topLevelCartItems,
        amount: Number(grand_total ?? 0) * 100, // Paystack expects kobo (1 NGN = 100 kobo)
        delivery_charge: Number(delivery_charge ?? 0),
        currency: "NGN",
        callback_url: `${window.location.origin}/checkoutsuccess/2`,
        metadata: {
          order_notes: "",
          preferred_delivery_time: "",
          source: "web",
          device_id: "",
        },
        order_payload: {
          guest_info: guestInfoPayload,
          delivery_address: deliveryAddress,
          cart_items: orderPayloadCartItems,
          payment: {
            payment_reference: "",
            payment_method: "paystack",
            transaction_reference: "",
            amount_paid: Number(grand_total ?? 0),
            payment_status: "pending",
            paid_at: "",
          },
          delivery: {
            delivery_token: deliveryToken ?? "",
            delivery_charge: Number(delivery_charge ?? 0),
            total_weight: totalWeight,
            estimated_delivery_days: 0,
          },
          order_summary: {
            subtotal: Number(total ?? 0),
            delivery_fee: Number(delivery_charge ?? 0),
            tax: 0,
            discount: Number(discount ?? 0),
            total: Number(grand_total ?? 0),
          },
          metadata: {
            order_notes: "",
            preferred_delivery_time: "",
            source: "web",
            device_id: "",
          },
        },
      };

      // Store for fallback to /order/guest if webhook fails
      localStorage.setItem("guest_order_payload", JSON.stringify(guestPayload));

      const response = await PUBLIC_POST(API.PAYSTACK_INITIALIZE_GUEST, guestPayload as unknown as Record<string, unknown>);
      const authUrl =
        response?.data?.authorization_url ||
        response?.authorization_url ||
        null;

      if (authUrl) {
        window.location.href = authUrl;
      } else {
        throw new Error(response?.message || "Payment initialization failed. Please try again.");
      }
    } catch (err: unknown) {
      setIsLoading(false);
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      notificationApi.error({
        message: "Payment Failed",
        description: message,
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
        <div className="checkout-steps">
          {/* Step 1: Delivery Address */}
          <div
            className={`step-card ${
              currentStep === 1
                ? "step-card--active"
                : currentStep > 1
                  ? "step-card--completed"
                  : ""
            }`}
          >
            <div className="step-card__header">
              <div className="step-number">{currentStep > 1 ? "✓" : "1"}</div>
              <div className="step-card__title">Delivery Address</div>
              {currentStep > 1 && (
                <div className="step-card__header-right">
                  <span className="step-completed-badge">Completed</span>
                  <button
                    className="step-edit-btn"
                    onClick={() => setCurrentStep(1)}
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
            {currentStep > 1 && Checkout?.address && (
              <div className="step-card__summary">
                📍{" "}
                {[
                  Checkout.address?.address,
                  Checkout.address?.city,
                  Checkout.address?.stateDetails?.name ||
                    Checkout.address?.state,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </div>
            )}
            {currentStep === 1 && (
              <div className="step-card__body">
                <NewAddressBox onContinue={() => setCurrentStep(2)} />
              </div>
            )}
          </div>

          {/* Step 2: Payment Method */}
          <div
            className={`step-card ${
              currentStep === 2
                ? "step-card--active"
                : currentStep > 2
                  ? "step-card--completed"
                  : "step-card--locked"
            }`}
          >
            <div className="step-card__header">
              <div className="step-number">{currentStep > 2 ? "✓" : "2"}</div>
              <div className="step-card__title">Payment Method</div>
              {currentStep > 2 && (
                <div className="step-card__header-right">
                  <span className="step-completed-badge">Completed</span>
                  <button
                    className="step-edit-btn"
                    onClick={() => setCurrentStep(2)}
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
            {currentStep > 2 && (
              <div className="step-card__summary">💳 Paystack</div>
            )}
            {currentStep === 2 && (
              <div className="step-card__body">
                <PaymentBox
                  onContinue={() => setCurrentStep(3)}
                />
              </div>
            )}
          </div>

          {/* Step 3: Review & Place Order */}
          <div
            className={`step-card ${
              currentStep === 3 ? "step-card--active" : "step-card--locked"
            }`}
          >
            <div className="step-card__header">
              <div className="step-number">3</div>
              <div className="step-card__title">Review & Place Order</div>
            </div>
            {currentStep === 3 && (
              <div className="step-card__body">
                <SummaryCard
                  Cart={Checkout}
                  total={total}
                  delivery_charge={delivery_charge}
                  grand_total={grand_total}
                  placeOrder={() => PlaceOrder()}
                  loading={isLoading}
                  discount={discount}
                  selectedAddress={Checkout?.address}
                  selectedPayment="Paystack"
                />
              </div>
            )}
          </div>
        </div>
      </Container>
      <br />
    </div>
  );
}
export default Checkout;
