"use client";

import { useState } from "react";
import { Modal, Rate, Input, Button, Form, Avatar, Progress } from "antd";
import { useMutation } from "@tanstack/react-query";
import { POST } from "@/util/apicall";
import API from "@/config/API";
import { useRouter } from "next/navigation";
import { CheckCircleFilled, StarFilled } from "@ant-design/icons";

interface ReviewProduct {
  productId?: number | string;
  product_id?: number | string;
  pid?: number | string;
  id?: number | string;
  _id?: string;
  product?: { id?: number | string; pid?: number | string; _id?: string };
  name?: string;
  image?: string;
  totalPrice?: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  products: ReviewProduct[];
}

const desc = ["Terrible", "Bad", "Okay", "Good", "Wonderful"];

export default function PostOrderReviewModal({ open, onClose, products }: Props) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();

  const current = products[step];
  const total = products.length;

  const isUUID = (v: unknown): v is string =>
    typeof v === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

  const getProductId = (p: ReviewProduct) =>
    (isUUID(p?.product?._id) ? p.product!._id : null) ??
    (isUUID(p?._id) ? p._id : null) ??
    (isUUID(p?.product?.pid) ? p.product!.pid : null) ??
    (isUUID(p?.pid) ? p.pid : null) ??
    p?.product_id ?? p?.productId ?? p?.product?.id ?? p?.product?.pid ?? p?.pid ?? null;

  const goNext = () => {
    form.resetFields();
    if (step + 1 >= total) {
      setDone(true);
    } else {
      setStep((s) => s + 1);
    }
  };

  const mutationCreate = useMutation({
    mutationFn: async (body: any) => {
      return POST(API.PRODUCT_REVIEW, {
        product_id: getProductId(current),
        ...body,
      });
    },
    retry: 2,
    onError: () => {
      goNext();
    },
    onSuccess: () => {
      router.refresh();
      goNext();
    },
  });

  const handleClose = () => {
    setStep(0);
    setDone(false);
    form.resetFields();
    onClose();
  };

  if (!products.length) return null;

  return (
    <Modal
      open={open}
      centered
      footer={null}
      onCancel={handleClose}
      closable={!done}
      width={440}
      styles={{
        header: { display: "none" },
        body: { padding: 0 },
        content: { borderRadius: 16, overflow: "hidden" },
      }}
    >
      {done ? (
        <div style={{ textAlign: "center", padding: "48px 32px 40px" }}>
          <CheckCircleFilled style={{ fontSize: 56, color: "#52c41a", marginBottom: 16 }} />
          <div style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a", marginBottom: 8 }}>
            Thanks for your review!
          </div>
          <div style={{ fontSize: 14, color: "#888", marginBottom: 28, lineHeight: 1.6 }}>
            Your feedback helps other shoppers make better choices.
          </div>
          <Button type="primary" size="large" onClick={handleClose} style={{ minWidth: 120, borderRadius: 8 }}>
            Done
          </Button>
        </div>
      ) : (
        <div>
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #f6f7fb 0%, #eef0f8 100%)",
              padding: "24px 24px 20px",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #faad14, #fa8c16)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <StarFilled style={{ color: "#fff", fontSize: 18 }} />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.3 }}>
                  Leave a Review
                </div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                  Your review is posted publicly on the app
                </div>
              </div>
            </div>

            {total > 1 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ fontSize: 12, color: "#555", fontWeight: 500 }}>
                    {current?.name ?? "Product"}
                  </div>
                  <div style={{ fontSize: 12, color: "#888" }}>
                    {step + 1} / {total}
                  </div>
                </div>
                <Progress
                  percent={Math.round(((step + 1) / total) * 100)}
                  showInfo={false}
                  strokeColor="#faad14"
                  trailColor="#e8e8e8"
                  size={["100%", 4] as any}
                />
              </div>
            )}
          </div>

          {/* Product info */}
          {current?.image || current?.name ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "16px 24px",
                borderBottom: "1px solid #f5f5f5",
                background: "#fff",
              }}
            >
              {current?.image && (
                <Avatar
                  src={current.image}
                  size={52}
                  shape="square"
                  style={{ borderRadius: 8, flexShrink: 0, border: "1px solid #f0f0f0" }}
                />
              )}
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a", lineHeight: 1.4 }}>
                  {current?.name ?? "Product"}
                </div>
                {current?.totalPrice != null && (
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                    Total paid: ₦{current.totalPrice.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Form */}
          <div style={{ padding: "24px 24px 20px", background: "#fff" }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={(values) => mutationCreate.mutate(values)}
              initialValues={{ featured: false }}
            >
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>
                  How would you rate this product?
                </div>
                <Form.Item name="rating" rules={[{ required: true, message: "Please select a rating" }]} style={{ marginBottom: 0 }}>
                  <Rate tooltips={desc} style={{ fontSize: 36 }} />
                </Form.Item>
              </div>

              <Form.Item name="message" rules={[{ required: true, message: "Please write a review" }]} style={{ marginBottom: 16 }}>
                <Input.TextArea
                  placeholder="Share your experience with this product..."
                  rows={4}
                  style={{ borderRadius: 8, resize: "none", fontSize: 14 }}
                />
              </Form.Item>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <Button
                  onClick={goNext}
                  style={{ borderRadius: 8, minWidth: 80 }}
                >
                  Skip
                </Button>
                <Button
                  type="primary"
                  onClick={form.submit}
                  loading={mutationCreate.isPending}
                  style={{ borderRadius: 8, minWidth: 100 }}
                >
                  {step + 1 === total ? "Submit" : "Next"}
                </Button>
              </div>
            </Form>
          </div>
        </div>
      )}
    </Modal>
  );
}
