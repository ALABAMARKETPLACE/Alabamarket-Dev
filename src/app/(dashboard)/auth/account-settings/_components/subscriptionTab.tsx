"use client";
import React, { useEffect, useState, useRef } from "react";
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
  Modal,
  Form,
  Select,
} from "antd";
import {
  CheckCircleOutlined,
  SyncOutlined,
  CrownOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";
import { GET, POST, PUT } from "@/util/apicall";
import API from "@/config/API";
import API_ADMIN from "@/config/API_ADMIN";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import moment from "moment";

function SubscriptionTab() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(false);
  
  // State for Product Selection Modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [verifiedPlanId, setVerifiedPlanId] = useState<string | null>(null);
  const [verifiedReference, setVerifiedReference] = useState<string | null>(null);
  const [submittingProducts, setSubmittingProducts] = useState(false);
  const [form] = Form.useForm();
  
  const verificationAttempted = useRef(false);

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

  // Get seller products for boosting
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["seller-products-boost"],
    queryFn: () => GET(API_ADMIN.FEATURED_PRODUCTS_PRODUCTS),
    enabled: showProductModal, // Only fetch when modal is open
  });

  const products = Array.isArray(productsData?.data?.data) 
    ? productsData.data.data 
    : Array.isArray(productsData?.data) 
      ? productsData.data 
      : [];

  // Handle Payment Verification on Mount
  useEffect(() => {
    const reference = searchParams.get("reference");
    const tab = searchParams.get("tab");
    const planId = searchParams.get("plan_id");

    if (reference && tab === "subscription" && planId && !verificationAttempted.current) {
      verificationAttempted.current = true;
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
          subscription_status: "active",
        });

        if (updateResp?.status) {
          notification.success({
            message: "Subscription Updated",
            description: "Your subscription is now active.",
          });
          refetchStore();
          
          // Open Product Selection Modal instead of redirecting immediately
          setVerifiedPlanId(planId);
          setVerifiedReference(reference);
          setShowProductModal(true);
          
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
      // If failed, clean URL anyway to avoid loops? 
      // Better to let user see error and maybe try again or contact support
      verificationAttempted.current = false; // Allow retry if it was a transient error?
    } finally {
      setVerifying(false);
    }
  };

  const handleProductSubmission = async (values: any) => {
    try {
      if (submittingProducts) return;
      setSubmittingProducts(true);
      const plan = plans.find((p: any) => p.id == verifiedPlanId);
      const price = Number(plan?.price || plan?.price_per_day || 0);

      // Create Boost Request (Auto-linked to subscription payment)
      const payload = {
        plan_id: verifiedPlanId,
        product_ids: values.product_ids,
        remarks: "Initial subscription product selection",
        amount: price,
        seller_id: storeData?._id,
        payment_reference: verifiedReference,
        payment_status: "success",
        // status: "approved", // Removed auto-approve, wait for admin
      };

      const response: any = await POST(API_ADMIN.BOOST_REQUESTS, payload);

      if (response?.status) {
        notification.success({
          message: "Products Boosted!",
          description: "Your selected products have been assigned to your plan section.",
        });
        finishSubscriptionProcess();
      } else {
        throw new Error(response?.message || "Failed to boost products");
      }
    } catch (err: any) {
      notification.error({
        message: "Boost Failed",
        description: err?.message || "Could not assign products. You can try again later from Boost Requests.",
      });
      // Even if boost fails, subscription succeeded, so we finish.
      finishSubscriptionProcess();
    } finally {
      // setSubmittingProducts(false); // Don't reset to false here to prevent re-submission if component unmounts/redirects slow
    }
  };

  const finishSubscriptionProcess = () => {
    setShowProductModal(false);
    form.resetFields();
    router.replace("/auth/account-settings?tab=subscription");
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
      const amountInKobo = Math.round(Number(plan.price || plan.price_per_day || 0) * 100);
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
      {/* Product Selection Modal */}
      <Modal
        title="Select Products for Boosting"
        open={showProductModal}
        onCancel={() => {
           if(submittingProducts) return;
           finishSubscriptionProcess();
        }}
        footer={null}
        width={600}
        maskClosable={false}
        closable={!submittingProducts}
      >
        <div className="mb-4">
           <Alert 
             message="Subscription Successful!" 
             description="Please select the products you want to feature in your new plan's section. They will appear immediately after processing."
             type="success" 
             showIcon 
             className="mb-3"
           />
           <Form form={form} layout="vertical" onFinish={handleProductSubmission}>
              <Form.Item
                name="product_ids"
                label="Select Products"
                rules={[{ required: true, message: "Please select at least one product" }]}
              >
                 <Select
                    mode="multiple"
                    placeholder="Choose products..."
                    style={{ width: "100%" }}
                    loading={productsLoading}
                    maxCount={plans.find((p: any) => p.id == verifiedPlanId)?.max_products}
                    options={products.map((p: any) => ({
                       label: p.name,
                       value: p._id || p.id
                    }))}
                 />
              </Form.Item>
              <div className="text-end">
                 <Button onClick={() => finishSubscriptionProcess()} className="me-2" disabled={submittingProducts}>
                    Skip for Now
                 </Button>
                 <Button type="primary" htmlType="submit" loading={submittingProducts}>
                    Boost Products
                 </Button>
              </div>
           </Form>
        </div>
      </Modal>
    </div>
  );
}

export default SubscriptionTab;
