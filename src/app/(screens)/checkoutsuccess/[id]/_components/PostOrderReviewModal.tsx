"use client";

import { useState } from "react";
import { Modal, Rate, Input, Button, Form, notification } from "antd";
import { useMutation } from "@tanstack/react-query";
import { POST } from "@/util/apicall";
import API from "@/config/API";
import { useRouter } from "next/navigation";

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

const desc = ["terrible", "bad", "normal", "good", "wonderful"];

export default function PostOrderReviewModal({ open, onClose, products }: Props) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [form] = Form.useForm();
  const router = useRouter();
  const [Notifications, contextHolder] = notification.useNotification();

  const current = products[step];
  const total = products.length;

  const getProductId = (p: ReviewProduct) =>
    p?.product?._id ?? p?._id ?? p?.product_id ?? p?.productId ?? p?.product?.id ?? p?.product?.pid ?? p?.pid ?? null;

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
    onError: (error) => {
      Notifications["error"]({ message: error.message });
    },
    onSuccess: () => {
      Notifications["success"]({
        message: `Review Added Successfully.`,
      });
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
    <>
      {contextHolder}
      <Modal
        title={`Leave a review`}
        open={open}
        centered
        footer={false}
        onCancel={handleClose}
      >
        {done ? (
          <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
            <div style={{ fontSize: 15, marginBottom: 16, color: "#444" }}>
              Your feedback helps other shoppers make better choices.
            </div>
            <Button type="primary" onClick={handleClose}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <div>Your review will be posted publicly on the app</div>
            {total > 1 && (
              <div style={{ color: "#888", fontSize: 13, marginBottom: 8 }}>
                {current?.name ?? "Product"} · {step + 1} of {total}
              </div>
            )}
            <Form
              form={form}
              layout="vertical"
              onFinish={(values) => mutationCreate.mutate(values)}
              initialValues={{ featured: false }}
            >
              <div>
                <Form.Item name={"rating"} rules={[{ required: true, message: "" }]}>
                  <Rate tooltips={desc} value={0} style={{ fontSize: 40 }} />
                </Form.Item>
                <Form.Item name={"message"} rules={[{ required: true, message: "" }]}>
                  <Input.TextArea
                    placeholder="Enter your review here . . . "
                    rows={4}
                    name="message"
                  />
                </Form.Item>
              </div>

              <div className="d-flex gap-2 justify-content-end">
                <Button onClick={goNext}>Skip</Button>
                <Button
                  type="primary"
                  onClick={form.submit}
                  loading={mutationCreate.isPending}
                >
                  {step + 1 === total ? "Done" : "Next"}
                </Button>
              </div>
            </Form>
          </>
        )}
      </Modal>
    </>
  );
}
