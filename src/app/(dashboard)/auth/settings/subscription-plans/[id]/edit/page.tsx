"use client";
import React, { useEffect } from "react";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Switch,
  notification,
  Card,
} from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PUT, GET } from "@/util/apicall";
import API_ADMIN from "@/config/API_ADMIN";
import { useRouter } from "next/navigation";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import Loading from "@/app/(dashboard)/_components/loading";
import Error from "@/app/(dashboard)/_components/error";

interface Props {
  params: {
    id: string;
  };
}

function EditSubscriptionPlan({ params }: Props) {
  const [form] = Form.useForm();
  const [Notifications, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data, isLoading, isError, error } = useQuery<any>({
    queryKey: ["subscription-plan", params.id],
    queryFn: ({ signal }) =>
      GET(API_ADMIN.SUBSCRIPTION_PLANS + params.id, {}, signal),
  });

  const mutationUpdate = useMutation({
    mutationFn: (body: any) => {
      // Ensure numeric fields are sent as numbers
      const payload = {
        id: Number(params.id),
        ...body,
      };

      if (payload.price !== undefined && payload.price !== null) {
        payload.price = Number(payload.price);
      }
      if (payload.duration_days !== undefined && payload.duration_days !== null) {
        payload.duration_days = Number(payload.duration_days);
      }

      return PUT(API_ADMIN.SUBSCRIPTION_PLANS, payload);
    },
    onError: (error, variables, context) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      Notifications["success"]({
        message: `Subscription Plan Updated Successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      queryClient.invalidateQueries({
        queryKey: ["subscription-plan", params.id],
      });
      setTimeout(() => {
        router.push(`/auth/settings/subscription-plans/${params.id}`);
      }, 1000);
    },
  });

  useEffect(() => {
    if (data?.data) {
      form.setFieldsValue({
        name: data.data.name,
        min_products: Number(data.data.min_products),
        max_products: Number(data.data.max_products),
        duration_days: Number(data.data.duration_days),
        price: Number(data.data.price),
        is_active: data.data.is_active,
      });
    }
  }, [data, form]);

  if (isLoading) return <Loading />;
  if (isError) return <Error description={error?.message} />;

  return (
    <div>
      {contextHolder}
      <PageHeader
        title="Edit Subscription Plan"
        bredcume="Settings / Subscription Plans / Edit"
      />

      <Card style={{ maxWidth: 800, margin: "0 auto" }}>
        <Form form={form} layout="vertical" onFinish={mutationUpdate.mutate}>
          <Form.Item
            label="Plan Name"
            name="name"
            rules={[
              {
                required: true,
                message: "Please enter the plan name",
              },
            ]}
          >
            <Input placeholder="e.g., Silver Plan, Gold Plan" size="large" />
          </Form.Item>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <Form.Item
              label="Minimum Products"
              name="min_products"
              rules={[
                {
                  required: true,
                  message: "Please enter minimum products",
                },
                {
                  type: "number",
                  min: 1,
                  message: "Must be at least 1",
                },
              ]}
            >
              <InputNumber
                placeholder="e.g., 1"
                size="large"
                style={{ width: "100%" }}
                min={1}
              />
            </Form.Item>

            <Form.Item
              label="Maximum Products"
              name="max_products"
              rules={[
                {
                  required: true,
                  message: "Please enter maximum products",
                },
                {
                  type: "number",
                  min: 1,
                  message: "Must be at least 1",
                },
              ]}
            >
              <InputNumber
                placeholder="e.g., 10"
                size="large"
                style={{ width: "100%" }}
                min={1}
              />
            </Form.Item>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <Form.Item
              label="Duration (Days)"
              name="duration_days"
              rules={[
                {
                  required: true,
                  message: "Please enter duration in days",
                },
                {
                  type: "number",
                  min: 1,
                  message: "Must be at least 1 day",
                },
              ]}
            >
              <InputNumber
                placeholder="e.g., 30"
                size="large"
                style={{ width: "100%" }}
                min={1}
                suffix="days"
              />
            </Form.Item>

            <Form.Item
              label="Price (Total Amount ₦)"
              name="price"
              rules={[
                {
                  required: true,
                  message: "Please enter total price",
                },
              ]}
            >
              <InputNumber
                placeholder="e.g., 5000.00"
                size="large"
                style={{ width: "100%" }}
                min={0}
                precision={2}
                prefix="₦"
              />
            </Form.Item>
          </div>

          <Form.Item
            label="Active Status"
            name="is_active"
            valuePropName="checked"
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          <div
            style={{
              background: "#e6f7ff",
              padding: 16,
              borderRadius: 8,
              marginBottom: 16,
              border: "1px solid #91d5ff",
            }}
          >
            <div style={{ fontSize: 12, color: "#0050b3", marginBottom: 8 }}>
              💡 Plan Summary:
            </div>
            <div style={{ fontSize: 13, color: "#003a8c" }}>
              Sellers can boost <strong>min-max products</strong> for the specified{" "}
              <strong>duration</strong> at the <strong>total price</strong>.
            </div>
          </div>

          <div className="d-flex gap-2 justify-content-end">
            <Button
              onClick={() => router.push("/auth/settings?tab=7")}
              size="large"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={mutationUpdate.isPending}
              size="large"
            >
              Update Plan
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default EditSubscriptionPlan;
