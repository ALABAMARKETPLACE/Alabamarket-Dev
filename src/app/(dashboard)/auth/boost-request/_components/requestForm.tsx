"use client";
import React, { useState, useEffect } from "react";
import { Button, Form, Select, Card, Input, InputNumber } from "antd";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API_ADMIN from "@/config/API_ADMIN";
import API from "@/config/API";
import Loading from "@/app/(dashboard)/_components/loading";
import "../styles.scss";

const { TextArea } = Input;

interface Plan {
  id?: number;
  _id?: number;
  name: string;
  min_products: number;
  max_products: number;
  duration_days?: number;
  duration?: number;
  price?: number;
  price_per_day?: number;
  featured_position?: number;
}

interface Product {
  _id: number;
  name: string;
  price: number;
}

interface InitialData {
  plan_id: number;
  product_ids: number[];
  remarks?: string;
}

interface RequestFormProps {
  initialData?: InitialData;
  onSubmit: (values: {
    plan_id: number;
    product_ids: number[];
    remarks?: string;
    amount: number;
    duration_days?: number;
  }) => void;
  loading?: boolean;
  mode: "create" | "edit";
  onCancel: () => void;
}

function RequestForm({
  initialData,
  onSubmit,
  loading = false,
  mode,
  onCancel,
}: RequestFormProps) {
  const [form] = Form.useForm();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [durationDays, setDurationDays] = useState<number>(1);

  const isDiscountedPlan = (plan: Plan | null) => {
    if (!plan) return false;
    return (
      plan.featured_position === 4 ||
      plan.name?.toLowerCase().includes("discount")
    );
  };

  // Fetch all subscription plans
  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ["subscription-plans-all"],
    queryFn: ({ signal }) => GET(API.SUBSCRIPTION_PLANS_ACTIVE, {}, signal),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  // Fetch seller's products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["seller-products"],
    queryFn: ({ signal }) =>
      GET(API_ADMIN.FEATURED_PRODUCTS_PRODUCTS, {}, signal),
  });

  // Helper to extract plans array
  const getPlansArray = (data: unknown): Plan[] => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = data as any;
    if (Array.isArray(d?.data?.data)) return d.data.data;
    if (Array.isArray(d?.data)) return d.data;
    return [];
  };

  const getProductsArray = (data: unknown): Product[] => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = data as any;
    if (Array.isArray(d?.data?.data)) return d.data.data;
    if (Array.isArray(d?.data)) return d.data;
    return [];
  };

  // Set initial form values for edit mode
  useEffect(() => {
    const plansList = getPlansArray(plansData);
    if (initialData && plansList.length > 0 && mode === "edit") {
      const plan = plansList.find(
        (p) => (p.id || p._id) === initialData.plan_id,
      );
      if (plan) {
        // Only update if not already set to avoid loops/redundant updates
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedPlan((prev) => {
          if (prev?.id === plan.id && prev?._id === plan._id) return prev;
          return plan;
        });
        setSelectedProducts((prev) => {
          const newIds = initialData.product_ids || [];
          if (
            prev.length === newIds.length &&
            prev.every((id, i) => id === newIds[i])
          ) {
            return prev;
          }
          return newIds;
        });

        form.setFieldsValue({
          plan_id: initialData.plan_id,
          product_ids: initialData.product_ids,
          remarks: initialData.remarks,
        });
      }
    }
  }, [initialData, plansData, form, mode]);

  // Helper to get plan price per day (for non-discounted plans)
  const getPlanPricePerDay = (plan: Plan | null) => {
    if (!plan) return 0;
    const price = Number(plan?.price_per_day || plan?.price);
    return isNaN(price) ? 0 : price;
  };

  // Helper to get fixed price (for discounted plans)
  const getPlanFixedPrice = (plan: Plan | null) => {
    if (!plan) return 0;
    const price = Number(plan?.price || plan?.price_per_day);
    return isNaN(price) ? 0 : price;
  };

  // Calculate total amount based on plan type
  const calculateTotal = (plan: Plan | null, days: number) => {
    if (!plan) return 0;
    if (isDiscountedPlan(plan)) {
      return getPlanFixedPrice(plan);
    }
    return getPlanPricePerDay(plan) * days;
  };

  const handlePlanChange = (planId: number) => {
    const plansList = getPlansArray(plansData);
    const plan = plansList.find((p) => (p.id || p._id) === planId) || null;
    setSelectedPlan(plan);
    setSelectedProducts([]);
    setDurationDays(1);
    form.setFieldsValue({ product_ids: [], duration_days: 1 });
  };

  const handleSubmit = (values: {
    plan_id: number;
    product_ids: number[];
    remarks?: string;
    duration_days?: number;
  }) => {
    const days = isDiscountedPlan(selectedPlan) ? undefined : (values.duration_days ?? durationDays);
    const amount = calculateTotal(selectedPlan, days ?? 1);

    const payload = {
      plan_id: values.plan_id,
      product_ids: values.product_ids,
      remarks: values.remarks,
      amount,
      ...(days !== undefined && { duration_days: days }),
    };
    onSubmit(payload);
  };

  if (plansLoading || productsLoading) return <Loading />;

  const plans = getPlansArray(plansData);
  const products = getProductsArray(productsData);

  return (
    <div className="boostRequests-formWrapper">
      <Card className="boostRequests-formCard">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="boostRequests-form"
        >
          <Form.Item
            label="Select Subscription Plan"
            name="plan_id"
            rules={[
              {
                required: true,
                message: "Please select a subscription plan",
              },
            ]}
          >
            <Select
              placeholder="Choose a plan"
              size="large"
              onChange={handlePlanChange}
              getPopupContainer={(trigger) =>
                (trigger?.parentElement as HTMLElement) || document.body
              }
              options={plans.map((plan: Plan) => ({
                value: plan.id || plan._id,
                label: isDiscountedPlan(plan)
                  ? `${plan.name} (${plan.min_products}-${plan.max_products} products, Fixed ₦${getPlanFixedPrice(plan).toLocaleString()})`
                  : `${plan.name} (${plan.min_products}-${plan.max_products} products, ₦${getPlanPricePerDay(plan).toLocaleString()}/day)`,
              }))}
            />
          </Form.Item>

          {selectedPlan && (
            <div className="boostRequests-planInfo">
              <div style={{ fontSize: 13, color: "#0050b3" }}>
                💡 Plan Info: Select between{" "}
                <strong>{selectedPlan.min_products}</strong> and{" "}
                <strong>{selectedPlan.max_products}</strong> products.{" "}
                {isDiscountedPlan(selectedPlan) ? (
                  <>
                    Fixed Price:{" "}
                    <strong>₦{getPlanFixedPrice(selectedPlan).toLocaleString()}</strong>
                  </>
                ) : (
                  <>
                    Price:{" "}
                    <strong>₦{getPlanPricePerDay(selectedPlan).toLocaleString()}</strong>{" "}
                    per day &times; <strong>{durationDays}</strong> day(s) ={" "}
                    <strong>₦{calculateTotal(selectedPlan, durationDays).toLocaleString()}</strong>
                  </>
                )}
              </div>
            </div>
          )}

          {selectedPlan && !isDiscountedPlan(selectedPlan) && (
            <Form.Item
              label="Number of Days"
              name="duration_days"
              initialValue={1}
              rules={[{ required: true, message: "Please enter number of days" }]}
            >
              <InputNumber
                min={1}
                max={365}
                size="large"
                style={{ width: "100%" }}
                addonAfter="days"
                onChange={(val) => setDurationDays(Number(val) || 1)}
              />
            </Form.Item>
          )}

          <Form.Item
            label="Select Products to Boost"
            name="product_ids"
            rules={[
              {
                required: true,
                message: "Please select at least one product",
              },
              () => ({
                validator(_, value) {
                  if (!selectedPlan) return Promise.resolve();
                  if (
                    value &&
                    value.length >= selectedPlan.min_products &&
                    value.length <= selectedPlan.max_products
                  ) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    `Please select between ${selectedPlan.min_products} and ${selectedPlan.max_products} products`,
                  );
                },
              }),
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Select products"
              size="large"
              disabled={!selectedPlan}
              onChange={setSelectedProducts}
              optionFilterProp="label"
              maxCount={selectedPlan?.max_products}
              getPopupContainer={(trigger) =>
                (trigger?.parentElement as HTMLElement) || document.body
              }
              options={products.map((product: Product) => ({
                value: product._id,
                label: `${product.name} (₦${product.price})`,
              }))}
              showSearch
            />
          </Form.Item>

          <Form.Item label="Remarks (Optional)" name="remarks">
            <TextArea
              rows={4}
              placeholder="Add any additional notes or remarks..."
            />
          </Form.Item>

          <div className="boostRequests-formActions">
            <Button
              onClick={onCancel}
              size="large"
              className="boostRequests-formAction"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              className="boostRequests-formAction"
              disabled={!selectedPlan || selectedProducts.length === 0}
            >
              {mode === "create" ? "Create Request" : "Update Request"}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default RequestForm;
