"use client";
import React, { useEffect, useState } from "react";
import "./styles.scss";
import { useSelector, useDispatch } from "react-redux";
import { VscError } from "react-icons/vsc";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { Col, Container, Row } from "react-bootstrap";
import { Avatar, Button, List, Spin, notification } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { clearCheckout } from "@/redux/slice/checkoutSlice";
import { GET, POST } from "@/util/apicall";
import API from "@/config/API";
import { storeCart } from "@/redux/slice/cartSlice";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import { useSession } from "next-auth/react";
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
  const Checkout = useSelector((state: any) => state?.Checkout?.order);
  const Settings = useAppSelector(reduxSettings);
  const [isLoading, setIsLoading] = useState<any>(true);
  const [paymentStatus, setPaymentStatus] = useState<any>();
  const [orderStatus, setOrderStatus] = useState<any>();
  const [Notifications, contextHolder] = notification.useNotification();
  const { data: user }: any = useSession();
  const User = user?.user;
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [responseData, setResponseData] = useState<any>({});
  const [orderCreated, setOrderCreated] = useState(false);

  // Get route parameter to determine payment method
  const routeId = params?.id;
  const isCOD = routeId === "1";
  const isPaystack = routeId === "2";

  useEffect(() => {
    window.scrollTo(0, 0);

    // Prevent duplicate order creation
    const orderAlreadyCreated = localStorage.getItem(
      "order_creation_completed"
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
        } catch (e) {}
      }
    }

    if (!orderCreated) {
      PlaceOrder();
    }
  }, [orderCreated]);

  const getOrderItems = (response: any[]) => {
    const array: any[] = [];
    if (Array.isArray(response)) {
      response.forEach((items: any) => {
        if (Array.isArray(items?.orderItems)) {
          items?.orderItems.forEach((item2: any) => {
            array.push(item2);
          });
        }
      });
    }
    setOrderItems(array);
  };

  const PlaceOrder = async () => {
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

        // Verify payment with backend
        console.log("Verifying payment with reference:", paymentRef);
        const verificationResponse: any = await POST(API.PAYSTACK_VERIFY, {
          reference: paymentRef,
        });

        console.log("Payment verification response:", verificationResponse);

        if (!verificationResponse?.status) {
          throw new Error(
            verificationResponse?.message ||
              "Payment verification failed. Please try again."
          );
        }

        // Payment verified successfully, proceed with order
        const storedOrderData = localStorage.getItem("paystack_order_data");
        let orderData = storedOrderData ? JSON.parse(storedOrderData) : null;

        finalOrderData = orderData?.order_data || {
          payment: {
            ref: paymentRef,
            type: "Pay Online",
          },
          cart: Checkout?.cart,
          address: Checkout?.address,
          charges: Checkout?.charges,
          user_id:
            User?.id ?? Checkout?.user_id ?? Checkout?.address?.user_id ?? null,
          user: User ?? Checkout?.user ?? null,
        };

        const resolvedUserId =
          finalOrderData.user_id ??
          finalOrderData.userId ??
          (finalOrderData.user as any)?.id ??
          Checkout?.user_id ??
          Checkout?.address?.user_id ??
          User?.id ??
          null;

        finalOrderData.user_id = resolvedUserId;

        if (!finalOrderData.userId && resolvedUserId) {
          finalOrderData.userId = resolvedUserId;
        }

        if (!finalOrderData.user && User) {
          finalOrderData.user = User;
        }

        console.log("Final Order Payload:", finalOrderData);

      } else {
        // Unknown route
        throw new Error("Invalid checkout route. Please try again.");
      }

      console.log("Final order data:", finalOrderData);

      // Validate cart data
      if (
        !finalOrderData?.cart ||
        !Array.isArray(finalOrderData.cart) ||
        finalOrderData.cart.length === 0
      ) {
        console.error("Invalid cart data:", finalOrderData?.cart);
        throw new Error(
          "Cart is empty. Unable to process order. Please start over."
        );
      }

      // Validate address data
      if (!finalOrderData?.address || !finalOrderData.address.id) {
        console.error("Invalid address data:", finalOrderData?.address);
        throw new Error(
          "Delivery address is invalid. Please go back and select a valid address."
        );
      }

      // Validate charges data
      if (!finalOrderData?.charges || !finalOrderData.charges.token) {
        console.error("Invalid charges data:", finalOrderData?.charges);
        throw new Error(
          "Delivery charge calculation failed. Please go back and recalculate."
        );
      }

      // Create order (payment already verified above for Paystack)
      const response: any = await POST(API.ORDER, finalOrderData);
      console.log("Order creation response:", response);

      if (response?.status) {
        getOrderItems(response?.data);
        setResponseData(response?.data);

        // Store order response for duplicate prevention
        localStorage.setItem(
          "last_order_response",
          JSON.stringify(response?.data)
        );
        localStorage.setItem("order_creation_completed", "true");

        setOrderStatus(true);

        // Clear stored payment data for successful orders
        if (isPaystack) {
          localStorage.removeItem("paystack_payment_reference");
          localStorage.removeItem("paystack_order_data");
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
    } catch (err: any) {
      setPaymentStatus(true);
      setOrderStatus(false);
      setIsLoading(false);
      setOrderCreated(false); // Allow retry on error

      console.error("Order creation error:", err);
      Notifications["error"]({
        message: "Order Processing Failed",
        description:
          err?.message ||
          err?.response?.data?.message ||
          "Something went wrong while processing your order.",
      });
    }
  };

  const loadCartItems = async () => {
    try {
      const userId = (User as any)?.data?.id || (User as any)?.id;
      if (userId) {
        const cartItems: any = await GET(API.CART_GET_ALL);
        if (cartItems.status) {
          dispatch(storeCart(cartItems.data));
          return;
        } else {
        }
      }
    } catch (err) {
      return;
    }
  };

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
                        <div style={{ color: "orange" }}>
                          {responseData?.[0]?.orderPayment?.status}
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
                      {responseData?.[0]?.orderPayment?.amount ?? ""}
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
                        {Number(responseData?.[0]?.newOrder?.total).toFixed(2)}
                      </div>
                    </div>
                    <div className="checkout-row">
                      <div>Discount</div>
                      <div>
                        {getCurrencySymbol(Settings?.currency)}{" "}
                        {Number(responseData?.[0]?.newOrder?.discount).toFixed(
                          2
                        )}
                      </div>
                    </div>
                    <div className="checkout-row">
                      <div>Tax</div>
                      <div>
                        {getCurrencySymbol(Settings?.currency)}{" "}
                        {Number(responseData?.[0]?.newOrder?.tax).toFixed(2)}
                      </div>
                    </div>
                    <div className="checkout-row">
                      <div>Delivery Charges</div>
                      <div>
                        {getCurrencySymbol(Settings?.currency)}{" "}
                        {Number(
                          responseData?.[0]?.newOrder?.deliveryCharge
                        ).toFixed(2)}
                      </div>
                    </div>
                    <hr />
                    <div className="checkout-row">
                      <div>Total</div>
                      <div>
                        {getCurrencySymbol(Settings?.currency)}{" "}
                        {Number(
                          responseData?.[0]?.newOrder?.grandTotal
                        ).toFixed(2)}
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
