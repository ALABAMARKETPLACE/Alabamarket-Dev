"use client";

import { useState, useCallback } from "react";
import { Modal, Rate, Input, Button, Form, notification } from "antd";
import { POST } from "@/util/apicall";
import API from "@/config/API";
import Image from "next/image";
import { FiSkipForward } from "react-icons/fi";
import { MdStarRate } from "react-icons/md";
import { IoCheckmarkCircle } from "react-icons/io5";

interface ReviewProduct {
  productId?: number | string;
  product_id?: number | string;
  pid?: number | string;
  id?: number | string;
  name?: string;
  image?: string;
  totalPrice?: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  products: ReviewProduct[];
}

const ratingLabels = ["Terrible", "Bad", "Okay", "Good", "Excellent"];
const ratingColors = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#16a34a"];

export default function PostOrderReviewModal({ open, onClose, products }: Props) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [form] = Form.useForm();
  const [Notifications, contextHolder] = notification.useNotification();

  const current = products[step];
  const total = products.length;

  const getProductId = (p: ReviewProduct) =>
    p?.productId ?? p?.product_id ?? p?.pid ?? p?.id ?? null;

  const handleSubmit = useCallback(async () => {
    const values = form.getFieldsValue();
    const pid = getProductId(current);

    if (!ratingValue) {
      Notifications.warning({ message: "Please select a star rating" });
      return;
    }

    try {
      setSubmitting(true);
      await POST(API.PRODUCT_REVIEW, {
        product_id: Number(pid),
        rating: ratingValue,
        message: values.message || "",
      });
      Notifications.success({ message: "Review submitted!", description: `Thanks for rating ${current?.name ?? "this product"}` });
    } catch {
      // silently skip on error — don't block the user
    } finally {
      setSubmitting(false);
      goNext();
    }
  }, [current, ratingValue, form]); // eslint-disable-line react-hooks/exhaustive-deps

  const goNext = () => {
    form.resetFields();
    setRatingValue(0);
    if (step + 1 >= total) {
      setDone(true);
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleClose = () => {
    // Reset for next time
    setStep(0);
    setDone(false);
    setRatingValue(0);
    form.resetFields();
    onClose();
  };

  if (!products.length) return null;

  return (
    <>
      {contextHolder}
      <Modal
        open={open}
        onCancel={handleClose}
        footer={null}
        centered
        width={420}
        closable={done}
        maskClosable={done}
        styles={{
          body: { padding: 0, borderRadius: 16, overflow: "hidden" },
          content: { borderRadius: 16, overflow: "hidden", padding: 0 },
        }}
      >
        {done ? (
          /* ── Thank You Screen ── */
          <div style={{ padding: "40px 32px", textAlign: "center" }}>
            <div style={{ fontSize: 64, marginBottom: 12 }}>🎉</div>
            <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 8, color: "#111" }}>
              Thank you!
            </div>
            <div style={{ color: "#666", fontSize: 15, marginBottom: 28 }}>
              Your feedback helps other shoppers make better choices.
            </div>
            <Button
              type="primary"
              size="large"
              onClick={handleClose}
              style={{
                background: "#FF5F15",
                border: "none",
                borderRadius: 10,
                fontWeight: 600,
                width: "100%",
                height: 48,
              }}
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          /* ── Review Step ── */
          <div>
            {/* Header */}
            <div
              style={{
                background: "linear-gradient(135deg, #FF5F15 0%, #ff8c00 100%)",
                padding: "20px 24px 16px",
                color: "#fff",
              }}
            >
              <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 4 }}>
                Rate your purchase · {step + 1} of {total}
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.3 }}>
                How was your experience?
              </div>

              {/* Progress dots */}
              <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
                {products.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: 4,
                      flex: 1,
                      borderRadius: 4,
                      background: i <= step ? "#fff" : "rgba(255,255,255,0.35)",
                      transition: "background 0.3s",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Product Card */}
            <div style={{ padding: "20px 24px 0" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  background: "#f9fafb",
                  borderRadius: 12,
                  padding: "12px 14px",
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 10,
                    overflow: "hidden",
                    flexShrink: 0,
                    background: "#eee",
                    position: "relative",
                  }}
                >
                  {current?.image ? (
                    <Image
                      src={current.image}
                      alt={current?.name || "Product"}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="64px"
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <MdStarRate size={28} color="#ddd" />
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: 14,
                      color: "#111",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {current?.name ?? "Product"}
                  </div>
                  {current?.totalPrice != null && (
                    <div style={{ color: "#888", fontSize: 13, marginTop: 2 }}>
                      ₦{Number(current.totalPrice).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Star Rating */}
              <div style={{ textAlign: "center", marginBottom: 8 }}>
                <Rate
                  value={ratingValue}
                  onChange={setRatingValue}
                  style={{ fontSize: 36, color: "#FF5F15" }}
                  character={({ index = 0 }) => (
                    <span style={{ margin: "0 3px" }}>★</span>
                  )}
                />
                <div
                  style={{
                    height: 22,
                    marginTop: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    color: ratingValue ? ratingColors[ratingValue - 1] : "#bbb",
                    transition: "color 0.2s",
                  }}
                >
                  {ratingValue ? ratingLabels[ratingValue - 1] : "Tap to rate"}
                </div>
              </div>

              {/* Review Text */}
              <Form form={form} style={{ marginTop: 8 }}>
                <Form.Item name="message" style={{ marginBottom: 0 }}>
                  <Input.TextArea
                    placeholder="Share your thoughts (optional)…"
                    autoSize={{ minRows: 2, maxRows: 4 }}
                    style={{
                      borderRadius: 10,
                      fontSize: 14,
                      resize: "none",
                      border: "1.5px solid #e5e7eb",
                    }}
                  />
                </Form.Item>
              </Form>
            </div>

            {/* Footer Actions */}
            <div
              style={{
                display: "flex",
                gap: 10,
                padding: "16px 24px 24px",
              }}
            >
              <Button
                onClick={goNext}
                icon={<FiSkipForward />}
                style={{
                  borderRadius: 10,
                  height: 46,
                  flex: "0 0 auto",
                  color: "#666",
                  border: "1.5px solid #e5e7eb",
                }}
              >
                Skip
              </Button>
              <Button
                type="primary"
                loading={submitting}
                onClick={handleSubmit}
                style={{
                  flex: 1,
                  height: 46,
                  borderRadius: 10,
                  background: ratingValue ? "#FF5F15" : "#ccc",
                  border: "none",
                  fontWeight: 600,
                  fontSize: 15,
                  transition: "background 0.2s",
                }}
              >
                {step + 1 === total ? "Submit & Finish" : "Submit & Next"}
              </Button>
            </div>

            {/* Checkmark done indicator per submitted step */}
            <div
              style={{
                padding: "0 24px 16px",
                display: "flex",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {products.map((_, i) => (
                <IoCheckmarkCircle
                  key={i}
                  size={16}
                  color={i < step ? "#22c55e" : i === step ? "#FF5F15" : "#e5e7eb"}
                  style={{ transition: "color 0.3s" }}
                />
              ))}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
