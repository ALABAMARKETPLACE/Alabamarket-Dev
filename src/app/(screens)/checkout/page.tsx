"use client";
import { useCallback, useEffect, useState } from "react";
import "../../(user)/cart/styles.scss";
import { Container, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { notification } from "antd";

import NewAddressBox from "./_components/newAddressBox";
import PaymentBox from "./_components/paymentBox";
import SummaryCard from "./_components/summaryCard";

import { useRouter } from "next/navigation";
import { POST } from "@/util/apicall";
import API from "@/config/API";
import { storeFinal } from "@/redux/slice/checkoutSlice";
import { useSession } from "next-auth/react";
import { useAppSelector } from "@/redux/hooks";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import { formatCurrency } from "@/utils/formatNumber";
import { formatGAItem, trackBeginCheckout } from "@/utils/analytics";

function Checkout() {
  const dispatch = useDispatch();
  const navigation = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
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
  }, []);

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
        // Map address to ensure country_id and state_id are present
        const addressData = {
          ...Checkout?.address,
          country_id:
            Checkout?.address?.country_id ||
            Checkout?.address?.countryDetails?.id,
          state_id:
            Checkout?.address?.state_id || Checkout?.address?.stateDetails?.id,
          country:
            Checkout?.address?.country ||
            Checkout?.address?.countryDetails?.country_name,
          state:
            Checkout?.address?.state || Checkout?.address?.stateDetails?.name,
        };

        // Use single item with quantity 1 for delivery calculation to avoid weight-based price scaling
        const firstItem = Checkout?.Checkout?.[0];
        const calculationCart = firstItem
          ? [
              {
                ...firstItem,
                quantity: 1,
                weight: firstItem?.weight || 1, // Ensure weight exists
              },
            ]
          : Checkout?.Checkout;

        const obj = {
          cart: calculationCart,
          address: addressData,
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response: any = await POST(
          API.NEW_CALCULATE_DELIVERY_CHARGE,
          obj,
        );

        if (response?.status) {
          setDeliveryToken(response?.token);
          const delivery = Number(response?.details?.totalCharge || 0);
          const discountVal = Number(response?.data?.discount || 0);
          const gTotal = Number(totals) + Number(delivery) - discountVal;
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

      // Convert amount to kobo (multiply by 100)
      const amountInKobo = Math.round(Number(grand_total) * 100);

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
        : "Customer";
      const customerEmail =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (user as any)?.email ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (user as any)?.id ||
        "customer@alabamarketplace.ng";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const customerId = (user as any)?.id || null;

      // Extract store ID for split payment
      const firstItem = Checkout?.Checkout?.[0];
      const storeId = firstItem?.storeId || firstItem?.store_id;

      console.log("DEBUG: Payment Initialization", {
        firstItem,
        storeId,
        hasStoreId: !!storeId,
      });

      const paymentData = {
        email: customerEmail,
        amount: amountInKobo,
        currency: "NGN",
        reference: reference,
        callback_url: `${window.location.origin}/checkoutsuccess/2`,
        // Add split payment parameters if storeId exists
        ...(storeId
          ? {
              store_id: Number(storeId),
              split_payment: true,
            }
          : {}),
        metadata: {
          order_id: reference,
          customer_id: customerId,
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
              display_name: "Delivery Charge",
              variable_name: "delivery_charge",
              value: `₦${formatCurrency(delivery_charge)}`,
            },
          ],
          cancel_url: `${window.location.origin}/checkout`,
        },
      };

      // Determine correct endpoint based on split payment
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const endpoint = (paymentData as any).split_payment
        ? API.PAYSTACK_INITIALIZE_SPLIT
        : API.PAYSTACK_INITIALIZE;

      // Log split payment data for debugging
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((paymentData as any).split_payment) {
        console.log("Initializing Split Payment:", {
          endpoint,
          paymentData,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          storeId: (paymentData as any).store_id,
          amount: paymentData.amount,
          split_type: "automatic (5% Platform / 95% Seller)",
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await POST(endpoint, paymentData);

      if (response.status && response.data?.data?.authorization_url) {
        // Store payment reference for verification
        localStorage.setItem("paystack_payment_reference", reference);
        localStorage.setItem(
          "paystack_order_data",
          JSON.stringify({
            reference,
            amount: amountInKobo,
            email: paymentData.email,
            order_data: {
              payment: {
                ref: reference,
                type: payment_method,
              },
              cart: Checkout?.Checkout,
              address: Checkout?.address,
              charges: {
                token: deliveryToken,
              },
              user_id: customerId,
              user: user,
            },
          }),
        );

        // Redirect to Paystack payment page
        window.location.href = response.data.data.authorization_url;
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
    if (deliveryToken) {
      try {
        const obj = {
          payment: payment_method,
          cart: Checkout?.Checkout,
          address: Checkout?.address,
          charges: {
            token: deliveryToken,
          },
          user_id: customerId,
          user: user,
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
