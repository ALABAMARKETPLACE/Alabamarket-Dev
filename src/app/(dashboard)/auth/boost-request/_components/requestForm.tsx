"use client";
import React, { useState, useEffect } from "react";
import { Button, Form, Select, Card, Input } from "antd";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API_ADMIN from "@/config/API_ADMIN";
import Loading from "@/app/(dashboard)/_components/loading";
import "../styles.scss";

const { TextArea } = Input;

interface RequestFormProps {
  initialData?: any;
  onSubmit: (values: any) => void;
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
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);

  // Fetch active subscription plans
  const { data: plansData, isLoading: plansLoading } = useQuery({
    queryKey: ["subscription-plans-active"],
    queryFn: ({ signal }) =>
      GET(API_ADMIN.SUBSCRIPTION_PLANS + "active", {}, signal),
  });

  // Fetch seller's products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["seller-products"],
    queryFn: ({ signal }) =>
      GET(API_ADMIN.PRODUCTS_BYSTORE, { status: "active" }, signal),
  });

  // Set initial form values for edit mode
  useEffect(() => {
    if (initialData && plansData?.data && mode === "edit") {
      const plan = plansData.data.find(
        (p: any) => p.id === initialData.plan_id
      );
      setSelectedPlan(plan);
      setSelectedProducts(initialData.product_ids || []);

      form.setFieldsValue({
        plan_id: initialData.plan_id,
        product_ids: initialData.product_ids,
        remarks: initialData.remarks,
      });
    }
  }, [initialData, plansData, form, mode]);

  // Helper to get plan duration
  const getPlanDuration = (plan: any) => {
    return Number(plan?.duration_days ?? 0);
  };

  // Helper to get plan price
  const getPlanPrice = (plan: any) => {
    return Number(plan?.price ?? 0);
  };

  const handlePlanChange = (planId: number) => {
    const plan = plansData?.data?.find((p: any) => p.id === planId);
    setSelectedPlan(plan);
    setSelectedProducts([]);
    form.setFieldsValue({ product_ids: [] });
  };

  const handleSubmit = (values: any) => {
    const payload = {
      plan_id: values.plan_id,
      product_ids: values.product_ids,
      remarks: values.remarks,
    };
    onSubmit(payload);
  };

  if (plansLoading || productsLoading) return <Loading />;

  const plans = plansData?.data || [];
  const products = Array.isArray(productsData?.data) ? productsData.data : [];

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
              options={plans.map((plan: any) => ({
                value: plan.id,
                label: `${plan.name} (${plan.min_products}-${
                  plan.max_products
                } products, ${getPlanDuration(plan)} days, ₦${getPlanPrice(
                  plan
                ).toFixed(2)})`,
              }))}
            />
          </Form.Item>

          {selectedPlan && (
            <div className="boostRequests-planInfo">
              <div style={{ fontSize: 13, color: "#0050b3" }}>
                💡 Plan Info: Select between{" "}
                <strong>{selectedPlan.min_products}</strong> and{" "}
                <strong>{selectedPlan.max_products}</strong> products. Duration:{" "}
                <strong>{getPlanDuration(selectedPlan)} days</strong>. Price:{" "}
                <strong>₦{getPlanPrice(selectedPlan).toFixed(2)}</strong>
              </div>
            </div>
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
                    `Please select between ${selectedPlan.min_products} and ${selectedPlan.max_products} products`
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
              options={products.map((product: any) => ({
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
              disabled={
                !selectedPlan || selectedProducts.length === 0
              }
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
