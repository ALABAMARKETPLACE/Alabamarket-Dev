"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import "./styles.scss";
import { useDispatch } from "react-redux";
import { IoIosCheckmarkCircleOutline, IoIosCloseCircleOutline } from "react-icons/io";
import { MdOutlineAccessTime } from "react-icons/md";
import { Col, Container, Row } from "react-bootstrap";
import { Button, Spin } from "antd";

import { clearCheckout } from "@/redux/slice/checkoutSlice";
import { DELETE, POST, PUBLIC_POST } from "@/util/apicall";
import API from "@/config/API";
import { clearCart } from "@/redux/slice/cartSlice";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

type VerifyState = "verifying" | "success" | "failed" | "processing" | "no_reference";

const MAX_POLLS = 4;
const POLL_INTERVAL_MS = 5000;

function CheckoutSuccessContent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status: authStatus } = useSession();

  const reference = searchParams.get("reference");
  const [verifyState, setVerifyState] = useState<VerifyState>(
    reference ? "verifying" : "no_reference",
  );
  const [errorMessage, setErrorMessage] = useState("");
  const pollCount = useRef(0);
  const hasCleared = useRef(false);
  const hasStarted = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCartAndOrder = () => {
    if (hasCleared.current) return;
    hasCleared.current = true;
    try {
      const fbq = (window as any).fbq;
      if (typeof fbq === "function") {
        const raw =
          localStorage.getItem("last_order_response") ||
          localStorage.getItem("order_payload");
        const parsed = raw ? JSON.parse(raw) : null;
        const value =
          parsed?.data?.total_price ??
          parsed?.total_price ??
          parsed?.amount ??
          undefined;
        fbq("track", "Purchase", {
          currency: "NGN",
          ...(value !== undefined && { value: Number(value) }),
        });
      }
    } catch {}
    localStorage.removeItem("order_payload");
    localStorage.removeItem("guest_order_payload");
    localStorage.removeItem("order_creation_completed");
    localStorage.removeItem("last_order_response");
    localStorage.removeItem("payment_provider");
    DELETE(API.CART_CLEAR_ALL).catch(() => {});
    dispatch(clearCart());
    dispatch(clearCheckout());
  };

  const doVerify = async (ref: string, isAuth: boolean) => {
    try {
      const provider = localStorage.getItem("payment_provider") ?? "paystack";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let response: any;

      if (provider === "budpay") {
        response = await POST(API.BUDPAY_VERIFY, { reference: ref });
      } else if (isAuth) {
        response = await POST(API.PAYSTACK_VERIFY, { reference: ref });
      } else {
        let guestEmail = "";
        try {
          const raw = localStorage.getItem("guest_order_payload");
          guestEmail = raw ? (JSON.parse(raw)?.guest_info?.email ?? "") : "";
        } catch {}
        response = await PUBLIC_POST(API.PAYSTACK_VERIFY_GUEST, { reference: ref, guest_email: guestEmail });
      }

      if (response?.status) {
        clearCartAndOrder();
        setVerifyState("success");
        return;
      }

      const msg =
        typeof response?.message === "string"
          ? response.message.toLowerCase()
          : "";
      const isTerminal =
        msg.includes("fail") ||
        msg.includes("cancel") ||
        msg.includes("abandon") ||
        msg.includes("declined");

      if (isTerminal) {
        setErrorMessage(response?.message || "Payment was not successful.");
        setVerifyState("failed");
        return;
      }

      if (pollCount.current < MAX_POLLS) {
        pollCount.current += 1;
        timeoutRef.current = setTimeout(() => doVerify(ref, isAuth), POLL_INTERVAL_MS);
      } else {
        setVerifyState("processing");
      }
    } catch {
      if (pollCount.current < MAX_POLLS) {
        pollCount.current += 1;
        timeoutRef.current = setTimeout(() => doVerify(ref, isAuth), POLL_INTERVAL_MS);
      } else {
        setErrorMessage("Unable to verify payment. Please contact support if money was deducted.");
        setVerifyState("failed");
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!reference || authStatus === "loading" || hasStarted.current) return;
    hasStarted.current = true;
    doVerify(reference, authStatus === "authenticated");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference, authStatus]);

  const retryVerify = () => {
    if (!reference) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    pollCount.current = 0;
    setVerifyState("verifying");
    doVerify(reference, authStatus === "authenticated");
  };

  /* ── Verifying ── */
  if (verifyState === "verifying") {
    return (
      <div className="Screen-box">
        <Container fluid style={{ minHeight: "80vh", padding: "32px 16px" }}>
          <Row className="g-3" style={{ justifyContent: "center" }}>
            <Col sm={7} xs={12}>
              <div className="cs-center-box">
                <Spin size="large" />
                <h2 style={{ marginTop: 20, fontSize: 20, fontWeight: 700, color: "#1a1a1a" }}>
                  Confirming your payment…
                </h2>
                <p style={{ color: "#6b7280", fontSize: 14, textAlign: "center", maxWidth: 340 }}>
                  Please wait while we verify your payment with Paystack. This
                  usually takes just a few seconds.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  /* ── Success ── */
  if (verifyState === "success") {
    return (
      <div className="Screen-box">
        <Container fluid style={{ minHeight: "80vh", padding: "32px 16px" }}>
          <Row className="g-3" style={{ justifyContent: "center" }}>
            <Col sm={7} xs={12}>
              <div className="cs-success-hero">
                <div className="cs-icon-ring cs-icon-ring--solid">
                  <IoIosCheckmarkCircleOutline size={48} color="#fff" />
                </div>
                <div className="cs-label-green">Order Confirmed</div>
                <div className="cs-title">Thank You!</div>
                <div className="cs-subtitle">
                  Your payment was successful and your order has been placed.
                  We&apos;ll send a confirmation to your registered email shortly.
                </div>
                <div className="cs-action-row">
                  <Button
                    type="primary"
                    size="large"
                    onClick={() =>
                      authStatus === "authenticated"
                        ? router.push("/user/orders")
                        : router.push(
                            `/track-order?ref=${encodeURIComponent(reference ?? "")}`,
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
          </Row>
        </Container>
      </div>
    );
  }

  /* ── Processing (payment verified but order still being created) ── */
  if (verifyState === "processing") {
    return (
      <div className="Screen-box">
        <Container fluid style={{ minHeight: "80vh", padding: "32px 16px" }}>
          <Row className="g-3" style={{ justifyContent: "center" }}>
            <Col sm={7} xs={12}>
              <div className="cs-center-box">
                <div className="cs-icon-ring cs-icon-ring--orange">
                  <MdOutlineAccessTime size={44} color="#f97316" />
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a" }}>
                  Your order is being processed
                </h2>
                <p style={{ color: "#6b7280", fontSize: 14, textAlign: "center", maxWidth: 380, lineHeight: 1.7 }}>
                  We received your payment but order confirmation is taking
                  longer than usual. Your order is being created — this
                  typically resolves within a few minutes.
                </p>
                {reference && (
                  <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
                    Payment reference: <code>{reference}</code>
                  </p>
                )}
                <div className="cs-action-row">
                  <Button
                    type="primary"
                    size="large"
                    onClick={retryVerify}
                    style={{ borderRadius: 10, minWidth: 150 }}
                  >
                    Check Status
                  </Button>
                  <Button
                    size="large"
                    onClick={() => router.replace("/")}
                    style={{ borderRadius: 10, minWidth: 150 }}
                  >
                    Go Home
                  </Button>
                </div>
                <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 12, textAlign: "center" }}>
                  You can track your order using the reference in your confirmation email.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  /* ── Failed / No reference ── */
  const isNoRef = verifyState === "no_reference";
  return (
    <div className="Screen-box">
      <Container fluid style={{ minHeight: "80vh", padding: "32px 16px" }}>
        <Row className="g-3" style={{ justifyContent: "center" }}>
          <Col sm={7} xs={12}>
            <div className="cs-center-box">
              <div className="cs-icon-ring cs-icon-ring--red">
                <IoIosCloseCircleOutline size={48} color="#ff4d4f" />
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a" }}>
                {isNoRef ? "Invalid Payment Link" : "Payment Not Completed"}
              </h2>
              <p style={{ color: "#6b7280", fontSize: 14, textAlign: "center", maxWidth: 380, lineHeight: 1.7 }}>
                {isNoRef
                  ? "This payment link is invalid or has expired. Please return to checkout and try again."
                  : errorMessage || "Your payment was not completed. Your cart is preserved — you can try again."}
              </p>
              <div className="cs-action-row">
                <Button
                  type="primary"
                  danger
                  size="large"
                  onClick={() => router.replace("/checkout")}
                  style={{ borderRadius: 10, minWidth: 160 }}
                >
                  Return to Checkout
                </Button>
                <Button
                  size="large"
                  onClick={() => router.replace("/")}
                  style={{ borderRadius: 10, minWidth: 150 }}
                >
                  Go Home
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="Screen-box">
          <Container fluid style={{ minHeight: "80vh", padding: "32px 16px" }}>
            <Row className="g-3" style={{ justifyContent: "center" }}>
              <Col sm={7} xs={12}>
                <div className="cs-center-box">
                  <Spin size="large" />
                  <p style={{ marginTop: 16, color: "#6b7280" }}>Loading…</p>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}

export default CheckoutSuccessPage;
