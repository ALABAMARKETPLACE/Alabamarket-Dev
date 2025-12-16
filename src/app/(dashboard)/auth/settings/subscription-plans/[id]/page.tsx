"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import API_ADMIN from "@/config/API_ADMIN";
import {
  Button,
  Card,
  Tag,
  Descriptions,
  Select,
  Alert,
  notification,
} from "antd";
import Loading from "@/app/(dashboard)/_components/loading";
import Error from "@/app/(dashboard)/_components/error";
import { useRouter } from "next/navigation";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import { GET, PUT } from "@/util/apicall";
import { TbEdit } from "react-icons/tb";

interface Props {
  params: {
    id: string;
  };
}

// Position labels mapping
const POSITION_LABELS: Record<
  number,
  { label: string; color: string; icon: string }
> = {
  0: { label: "Not Featured", color: "default", icon: "" },
  1: { label: "Top Section", color: "gold", icon: "🏆" },
  2: { label: "Middle Section", color: "blue", icon: "🥈" },
  3: { label: "Lower Section", color: "orange", icon: "🥉" },
  4: { label: "Extra Section", color: "purple", icon: "✨" },
};

function ViewSubscriptionPlan({ params }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [Notifications, contextHolder] = notification.useNotification();
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);

  const { data, isLoading, isError, error } = useQuery<any>({
    queryKey: ["subscription-plan", params.id],
    queryFn: ({ signal }) =>
      GET(API_ADMIN.SUBSCRIPTION_PLANS + params.id, {}, signal),
  });

  const plan = data?.data;

  // Mutation for updating featured position
  const mutationUpdatePosition = useMutation({
    mutationFn: (position: number) => {
      return PUT(API_ADMIN.SUBSCRIPTION_PLANS_FEATURED_POSITION, {
        id: Number(params.id),
        featured_position: position,
      });
    },
    onError: (error: any) => {
      Notifications["error"]({
        message: "Failed to update position",
        description: error.message,
      });
    },
    onSuccess: () => {
      Notifications["success"]({
        message: "Featured position updated successfully!",
      });
      queryClient.invalidateQueries({
        queryKey: ["subscription-plan", params.id],
      });
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      setSelectedPosition(null);
    },
  });

  const handleUpdatePosition = () => {
    if (selectedPosition !== null) {
      mutationUpdatePosition.mutate(selectedPosition);
    }
  };

  if (isLoading) return <Loading />;
  if (isError) return <Error description={error?.message} />;

  const currentPositionInfo =
    POSITION_LABELS[plan?.featured_position ?? 0] || POSITION_LABELS[0];

  return (
    <div>
      {contextHolder}
      <PageHeader
        title="Subscription Plan Details"
        bredcume="Settings / Subscription Plans / View"
      >
        <Button
          type="primary"
          icon={<TbEdit />}
          onClick={() =>
            router.push(`/auth/settings/subscription-plans/${params.id}/edit`)
          }
        >
          Edit Plan
        </Button>
      </PageHeader>

      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <Card>
          <Descriptions
            bordered
            column={1}
            size="middle"
            labelStyle={{ fontWeight: 600, width: "30%" }}
          >
            <Descriptions.Item label="Plan Name">
              <div style={{ fontSize: 16, fontWeight: 600, color: "#262941" }}>
                {plan?.name}
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Product Range">
              <div style={{ fontSize: 15 }}>
                <strong>{plan?.min_products}</strong> to{" "}
                <strong>{plan?.max_products}</strong> products
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Duration">
              <div style={{ fontSize: 16, fontWeight: 600, color: "#1890ff" }}>
                {plan?.duration_days || 0} days
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Price (Total)">
              <div style={{ fontSize: 16, fontWeight: 600, color: "#a10244" }}>
                ₦{Number(plan?.price || 0).toFixed(2)}
              </div>
            </Descriptions.Item>

            <Descriptions.Item label="Status">
              <Tag
                color={plan?.is_active ? "green" : "red"}
                style={{ fontSize: 14 }}
              >
                {plan?.is_active ? "Active" : "Inactive"}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Created At">
              {new Date(plan?.created_at).toLocaleString()}
            </Descriptions.Item>

            <Descriptions.Item label="Last Updated">
              {new Date(plan?.updated_at).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Featured Position Section */}
        <Card
          style={{ marginTop: 16 }}
          title={
            <span style={{ fontSize: 16 }}>
              🎯 Featured Position on Homepage
            </span>
          }
        >
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 8,
                color: "#666",
              }}
            >
              Current Position:
            </div>
            <Tag
              color={currentPositionInfo.color}
              style={{
                fontSize: 16,
                padding: "8px 16px",
                borderRadius: 6,
              }}
            >
              {currentPositionInfo.icon && (
                <span style={{ marginRight: 8 }}>
                  {currentPositionInfo.icon}
                </span>
              )}
              Position {plan?.featured_position ?? 0} -{" "}
              {currentPositionInfo.label}
            </Tag>
            <div
              style={{
                fontSize: 12,
                color: "#888",
                marginTop: 4,
              }}
            >
              {plan?.featured_position === 0
                ? "This plan is not featured on the homepage"
                : `Shows at ${currentPositionInfo.label.toLowerCase()} of homepage`}
            </div>
          </div>

          <div
            style={{
              borderTop: "1px solid #f0f0f0",
              paddingTop: 20,
              marginTop: 20,
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 12,
                color: "#666",
              }}
            >
              Change Position:
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <Select
                style={{ flex: 1, maxWidth: 400 }}
                size="large"
                placeholder="Select new position"
                value={selectedPosition}
                onChange={(value) => setSelectedPosition(value)}
                options={[
                  {
                    value: 0,
                    label: (
                      <span>
                        0 - Not Featured{" "}
                        <span style={{ color: "#888", fontSize: 12 }}>
                          (Not shown on homepage)
                        </span>
                      </span>
                    ),
                  },
                  {
                    value: 1,
                    label: (
                      <span>
                        🏆 1 - Top Section{" "}
                        <span style={{ color: "#888", fontSize: 12 }}>
                          (Most prominent)
                        </span>
                      </span>
                    ),
                  },
                  {
                    value: 2,
                    label: (
                      <span>
                        🥈 2 - Middle Section{" "}
                        <span style={{ color: "#888", fontSize: 12 }}>
                          (Second position)
                        </span>
                      </span>
                    ),
                  },
                  {
                    value: 3,
                    label: (
                      <span>
                        🥉 3 - Lower Section{" "}
                        <span style={{ color: "#888", fontSize: 12 }}>
                          (Third position)
                        </span>
                      </span>
                    ),
                  },
                  {
                    value: 4,
                    label: (
                      <span>
                        ✨ 4 - Extra Section{" "}
                        <span style={{ color: "#888", fontSize: 12 }}>
                          (Additional section)
                        </span>
                      </span>
                    ),
                  },
                ]}
              />
              <Button
                type="primary"
                size="large"
                onClick={handleUpdatePosition}
                loading={mutationUpdatePosition.isPending}
                disabled={selectedPosition === null}
              >
                Update Position
              </Button>
            </div>
          </div>

          <Alert
            style={{ marginTop: 20 }}
            message="ℹ️ How Featured Products Work"
            description="Featured products from this plan will automatically rotate every 10 minutes on the homepage at the selected position. All users worldwide see the same products at the same time."
            type="info"
            showIcon
          />
        </Card>

        <Card style={{ marginTop: 16 }} title="💡 Plan Summary">
          <div style={{ display: "grid", gap: 12 }}>
            <div
              style={{
                background: "#f6f6f6",
                padding: 16,
                borderRadius: 8,
              }}
            >
              <div style={{ fontSize: 14, color: "#666", marginBottom: 8 }}>
                This plan allows sellers to boost:
              </div>
              <div style={{ fontSize: 15, marginBottom: 6 }}>
                • <strong>{plan?.min_products} - {plan?.max_products}</strong> products
              </div>
              <div style={{ fontSize: 15, marginBottom: 6 }}>
                • Duration: <strong>{plan?.duration_days || 0} days</strong>
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#a10244",
                  marginTop: 12,
                  borderTop: "1px solid #e0e0e0",
                  paddingTop: 12,
                }}
              >
                Total Price: ₦{Number(plan?.price || 0).toFixed(2)}
              </div>
            </div>
          </div>
        </Card>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <Button
            onClick={() => router.push("/auth/settings?tab=7")}
            size="large"
          >
            Back to List
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ViewSubscriptionPlan;
