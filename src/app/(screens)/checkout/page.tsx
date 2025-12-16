"use client";
import React, { useEffect, useState } from "react";
import "../../(user)/cart/styles.scss";
import { Container, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { notification } from "antd";

import NewAddressBox from "./_components/newAddressBox";
import PaymentBox from "./_components/paymentBox";
import SummaryCard from "./_components/summaryCard";

import NotDeliverableModal from "./_components/notDeliverable";
import { useRouter } from "next/navigation";
import { GET, POST } from "@/util/apicall";
import API from "@/config/API";
import useToggle from "@/shared/hook/useToggle";
import { storeFinal } from "@/redux/slice/checkoutSlice";
import { useSession } from "next-auth/react";
import { useAppSelector } from "@/redux/hooks";
import { reduxSettings } from "@/redux/slice/settingsSlice";
function Checkout() {
  const dispatch = useDispatch();
  const navigation = useRouter();
  const { user }: any = useSession();
  const Checkout = useSelector((state: any) => state?.Checkout);
  const Settings = useAppSelector(reduxSettings);
  const [notificationApi, contextHolder] = notification.useNotification();
  const [payment_method, setPayment_method] = useState<any>("Pay Online");
  const [isLoading, setIsLoading] = useState<any>(false);
  const [deliveryToken, setDeliveryToken] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("");

  const [total, setTotal] = useState<any>(0);
  const [delivery_charge, setDelivery_charge] = useState<any>(0);
  const [discount, setDiscount] = useState(0);
  const [grand_total, setGrand_total] = useState<any>(0);
  const [openModal, toggleModal] = useToggle(false);
  useEffect(() => {
    window.scrollTo(0, 0);

    // Clear any previous order creation status to allow new orders
    localStorage.removeItem("order_creation_completed");
    localStorage.removeItem("last_order_response");
  }, []);

  console.log("user?.user ", user);

  useEffect(() => {
    CalculateDeliveryCharge();
  }, [Checkout?.address?.id]);

  const CalculateDeliveryCharge = async () => {
    try {
      var totals = 0;
      if (Array.isArray(Checkout?.Checkout) == true) {
        Checkout?.Checkout?.forEach((item: any) => {
          totals += Number(item?.totalPrice);
        });
      }
      setTotal(Number(totals).toFixed(2));
      setGrand_total(totals);

      if (Checkout?.address?.id) {
        // Prepare cart with weight information for new API
        const cartWithWeight = Checkout?.Checkout?.map((item: any) => ({
          weight: item?.weight || 1, // Default to 1kg if no weight specified
          quantity: item?.quantity || 1,
        }));

        // Prepare address with ID, country_id and state_id
        const addressData = {
          id: Checkout?.address?.id, // Include actual address ID for token validation
          country_id: Checkout?.address?.country_id || null,
          state_id: Checkout?.address?.state_id || null,
        };

        let obj = {
          cart: cartWithWeight,
          address: addressData,
        };

        const response: any = await POST(
          API.NEW_CALCULATE_DELIVERY_CHARGE,
          obj
        );

        if (response?.status) {
          setDeliveryToken(response?.token);
          let delivery = Number(response?.details?.totalCharge);
          let gTotal =
            Number(totals) +
            Number(delivery) -
            Number(response?.data?.discount);
          setDelivery_charge(delivery);
          setGrand_total(gTotal);
          setDiscount(response?.data?.discount);
        } else {
          // Clean up error message (remove @@ suffix if present)
          const cleanMessage = (response?.message ?? "").replace(/@@$/, "");
          toggleModal(true);
          setErrorMessage(
            cleanMessage || "Delivery not available for this location"
          );
          setDeliveryToken("");
          setDelivery_charge(0);
          setGrand_total(totals);
          setDiscount(0);
        }
      }
    } catch (err: any) {
      setDelivery_charge(0);
      setDiscount(0);
      setDeliveryToken("");
      console.log("Delivery calculation error:", err);

      // Show error to user if it's a delivery availability issue
      if (err?.response?.data?.message) {
        const cleanMessage = err.response.data.message.replace(/@@$/, "");
        toggleModal(true);
        setErrorMessage(cleanMessage);
      }
    }
  };

  const PlaceOrder = async () => {
    if (deliveryToken) {
      // if delivery details available..only
      let _payment = {
        ref: payment_method,
        type: payment_method,
      };
      console.log("this is the _payment", _payment);

      try {
        const obj = {
          payment: payment_method,
          cart: Checkout?.Checkout,
          address: Checkout?.address,
          charges: {
            token: deliveryToken,
          },
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
        toggleModal(true);
        // notificationApi.error({
        //   message: `Delivery to the Selected address is not available. Please choose another one.`,
        // });
        return;
      }
      notificationApi.error({
        message: `Please Choose a Delivery Address to place an Order`,
      });
    }
  };

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

      const paymentData = {
        email: user?.user?.email || "test@gmail.com",
        amount: amountInKobo,
        currency: "NGN",
        reference: reference,
        callback_url: `${window.location.origin}/checkoutsuccess/2`,
        metadata: {
          order_id: reference,
          customer_id: user?.user?.id || null,
          custom_fields: [
            {
              display_name: "Customer Name",
              variable_name: "customer_name",
              value: user?.user
                ? `${user?.user?.first_name} ${user?.user?.last_name}`
                : "Guest Customer",
            },
            {
              display_name: "Order Total",
              variable_name: "order_total",
              value: `₦${Number(grand_total).toFixed(2)}`,
            },
            {
              display_name: "Delivery Charge",
              variable_name: "delivery_charge",
              value: `₦${Number(delivery_charge).toFixed(2)}`,
            },
          ],
          cancel_url: `${window.location.origin}/checkout`,
        },
      };

      const response: any = await POST(API.PAYSTACK_INITIALIZE, paymentData);

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
            },
          })
        );

        // Redirect to Paystack payment page
        window.location.href = response.data.data.authorization_url;
      } else {
        throw new Error(response.message || "Payment initialization failed");
      }

      setIsLoading(false);
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

  return (
    <div className="Screen-box">
      {contextHolder}
      <br />
      <Container fluid style={{ minHeight: "80vh" }}>
        <Row>
          <Col sm={7}>
            <NewAddressBox />
            <PaymentBox
              method={payment_method}
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
      <NotDeliverableModal
        open={openModal}
        close={() => toggleModal(false)}
        message={errorMessage}
      />
    </div>
  );
}
export default Checkout;
