"use client";
import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  Button,
  Tag,
  List,
  Badge,
  notification,
  Spin,
  Row,
  Col,
  Statistic,
  Alert,
} from "antd";
import {
  CheckCircleOutlined,
  SyncOutlined,
  CrownOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { GET, POST, PUT } from "@/util/apicall";
import API from "@/config/API";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import moment from "moment";

function SubscriptionTab() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(false);

  // Get current store details (including subscription)
  const {
    data: storeData,
    isLoading: storeLoading,
    refetch: refetchStore,
  } = useQuery({
    queryKey: [API.CORPORATE_STORE_GETSELLERINFO],
    queryFn: () => GET(API.CORPORATE_STORE_GETSELLERINFO),
    select: (data: any) => (data?.status ? data?.data : null),
  });

  // Get active plans
  const { data: plans, isLoading: plansLoading } = useQuery({
    queryKey: ["subscription-plans-active"],
    queryFn: () => GET(API.SUBSCRIPTION_PLANS_ACTIVE),
    select: (data: any) => (Array.isArray(data?.data) ? data?.data : []),
  });

  // Handle Payment Verification on Mount
  useEffect(() => {
    const reference = searchParams.get("reference");
    const tab = searchParams.get("tab");
    const planId = searchParams.get("plan_id");

    if (reference && tab === "subscription" && planId) {
      verifyPayment(reference, planId);
    }
  }, [searchParams]);

  const verifyPayment = async (reference: string, planId: string) => {
    try {
      setVerifying(true);
      // Verify payment with Paystack
      const verifyResp: any = await POST(API.PAYSTACK_VERIFY, { reference });

      if (verifyResp?.status) {
        // Update seller subscription
        const updateResp: any = await PUT(API.CORPORATE_SELLER_UPDATE, {
          subscription_plan_id: planId,
          subscription_status: "active", // Ensure backend handles this or adjust payload
        });

        if (updateResp?.status) {
          notification.success({
            message: "Subscription Updated",
            description: "Your subscription has been successfully updated.",
          });
          refetchStore();
          // Clean URL
          router.replace("/auth/account-settings?tab=subscription");
        } else {
          throw new Error(updateResp?.message || "Failed to update subscription");
        }
      } else {
        throw new Error("Payment verification failed");
      }
    } catch (err: any) {
      notification.error({
        message: "Subscription Failed",
        description: err?.message || "Something went wrong during verification.",
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleSubscribe = async (plan: any) => {
    try {
      const user = session?.user as any;
      if (!user?.email) {
        notification.error({
          message: "Error",
          description: "User email is missing. Cannot proceed with payment.",
        });
        return;
      }

      // Initialize Paystack Payment
      const amountInKobo = Math.round(Number(plan.price_per_day || 0) * 100);
      const reference = `SUB_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`;

      const callbackUrl = `${window.location.origin}/auth/account-settings?tab=subscription&plan_id=${plan.id}`;

      const payload = {
        email: user.email,
        amount: amountInKobo,
        currency: "NGN",
        reference: reference,
        callback_url: callbackUrl,
        metadata: {
          plan_id: plan.id,
          plan_name: plan.name,
          store_id: storeData?._id,
          custom_fields: [
            {
              display_name: "Subscription Plan",
              variable_name: "subscription_plan",
              value: plan.name,
            },
          ],
        },
      };

      const response: any = await POST(API.PAYSTACK_INITIALIZE, payload);

      if (response?.status && response?.data?.data?.authorization_url) {
        window.location.href = response.data.data.authorization_url;
      } else {
        throw new Error(response?.message || "Failed to initialize payment");
      }
    } catch (err: any) {
      notification.error({
        message: "Payment Error",
        description: err?.message || "Could not start payment process.",
      });
    }
  };

  if (storeLoading || plansLoading || verifying) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  const currentPlanId = storeData?.subscription_plan_id;
  const currentPlanName = storeData?.subscription_plan_name || "Standard";

  return (
    <div className="subscription-tab">
      <Alert
        message="Manage Your Subscription"
        description="Choose a plan that fits your business needs. Upgrade or renew your subscription to unlock more features."
        type="info"
        showIcon
        className="mb-4"
      />

      {/* Current Subscription Status */}
      <Card title="Current Subscription" className="mb-4 shadow-sm">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Statistic
              title="Current Plan"
              value={currentPlanName}
              prefix={<CrownOutlined style={{ color: "#FFD700" }} />}
            />
          </Col>
          <Col xs={24} md={12}>
            <Statistic
              title="Status"
              value={storeData?.subscription_status || "Active"}
              valueStyle={{
                color:
                  storeData?.subscription_status === "expired"
                    ? "#cf1322"
                    : "#3f8600",
              }}
              prefix={
                storeData?.subscription_status === "expired" ? (
                  <SafetyCertificateOutlined />
                ) : (
                  <CheckCircleOutlined />
                )
              }
            />
          </Col>
        </Row>
      </Card>

      {/* Available Plans */}
      <div className="plans-section">
        <h3 className="mb-3">Available Plans</h3>
        <Row gutter={[16, 16]}>
          {plans.map((plan: any) => {
            const isCurrent = plan.id === currentPlanId;
            return (
              <Col xs={24} sm={12} md={8} key={plan.id}>
                <Card
                  hoverable
                  className={`h-100 ${isCurrent ? "border-primary" : ""}`}
                  title={
                    <div className="d-flex justify-content-between align-items-center">
                      <span>{plan.name}</span>
                      {isCurrent && <Tag color="blue">Current</Tag>}
                    </div>
                  }
                >
                  <div className="text-center mb-3">
                    <h2 className="mb-0">
                      ₦{Number(plan.price_per_day).toLocaleString()}
                    </h2>
                    <small className="text-muted">per day</small>
                  </div>

                  <List
                    size="small"
                    dataSource={[
                      `${plan.min_products} - ${plan.max_products} Products`,
                      // Add more features if available in plan object
                    ]}
                    renderItem={(item) => (
                      <List.Item>
                        <CheckCircleOutlined className="text-success me-2" />
                        {item}
                      </List.Item>
                    )}
                  />

                  <div className="mt-4 text-center">
                    <Button
                      type={isCurrent ? "default" : "primary"}
                      block
                      size="large"
                      disabled={isCurrent}
                      onClick={() => handleSubscribe(plan)}
                    >
                      {isCurrent ? "Active" : "Subscribe Now"}
                    </Button>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>
    </div>
  );
}

export default SubscriptionTab;
