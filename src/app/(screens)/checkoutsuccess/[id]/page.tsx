"use client";

import { useEffect } from "react";
import "./styles.scss";
import { useDispatch } from "react-redux";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { Col, Container, Row } from "react-bootstrap";
import { Button } from "antd";

import { clearCheckout } from "@/redux/slice/checkoutSlice";
import { DELETE } from "@/util/apicall";
import API from "@/config/API";
import { clearCart } from "@/redux/slice/cartSlice";
import { useRouter } from "next/navigation";

function Checkout() {
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);

    // Order was already created by the backend at /paystack/success callback.
    // Just clear local state and cart.
    localStorage.removeItem("order_payload");
    localStorage.removeItem("guest_order_payload");
    localStorage.removeItem("order_creation_completed");
    localStorage.removeItem("last_order_response");

    DELETE(API.CART_CLEAR_ALL).catch(() => {});
    dispatch(clearCart());
    dispatch(clearCheckout());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="Screen-box">
      <Container fluid style={{ minHeight: "80vh", padding: "32px 16px" }}>
        {/* ── SUCCESS ── */}
        <Row className="g-3" style={{ justifyContent: "center" }}>
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
                  onClick={() => router.push("/user/orders")}
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
        </Row>
      </Container>
    </div>
  );
}
export default Checkout;
