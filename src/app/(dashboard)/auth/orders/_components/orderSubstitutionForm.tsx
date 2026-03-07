import React, { useState, useEffect } from "react";
import { Form, Input, Select, notification, Skeleton } from "antd";
import { SwapOutlined } from "@ant-design/icons";
import API_ADMIN from "@/config/API_ADMIN";
import { GET } from "@/util/apicall";

interface OrderSubstitutionFormProps {
  orderId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any;
  isAdmin?: boolean;
  /** Called once the order is fetched — passes the real DB id back to the parent */
  onOrderLoaded?: (realId: number) => void;
}

const OrderSubstitutionForm: React.FC<OrderSubstitutionFormProps> = ({
  orderId,
  form,
  isAdmin,
  onOrderLoaded,
}) => {
  const [notificationApi, contextHolder] = notification.useNotification();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orderProduct, setOrderProduct] = useState<any[]>([]);
  const [orderedQty, setOrderedQty] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const getOrderProduct = async () => {
    setLoading(true);
    try {
      if (!orderId) {
        setLoading(false);
        return;
      }
      const endpoint = isAdmin
        ? API_ADMIN.ORDER_DETAILS + `${orderId}`
        : API_ADMIN.ORDER_GETONE_SELLER + `${orderId}`;
      const response: any = await GET(endpoint);
      if (response.data && response.data.orderItems) {
        setOrderProduct(response.data.orderItems);
        const realId = response.data.order_id ?? response.data.id ?? response.data._id;
        if (onOrderLoaded && realId) {
          onOrderLoaded(Number(realId));
        }
      } else {
        notificationApi.warning({
          message: "No order items found",
          description: "There are no products in this order to substitute",
        });
      }
    } catch {
      notificationApi.error({
        message: "Error fetching order data",
        description: "Oops! Something went wrong while fetching order details.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrderProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const productOptions =
    orderProduct?.map((item: any) => ({
      value: item.id,
      label: item.name,
    })) || [];

  const handleProductChange = (productId: number) => {
    const found = orderProduct?.find((item) => item.id === productId);
    if (found) {
      const qty = Number(found.quantity);
      setOrderedQty(qty);
      // Pre-fill substituteQuantity with ordered qty; clear availableQuantity for re-entry
      form.setFieldsValue({ substituteQuantity: qty, availableQuantity: undefined });
    }
  };

  if (loading) {
    return <Skeleton active paragraph={{ rows: 4 }} />;
  }

  return (
    <>
      {contextHolder}

      {/* Row 1 — full width: which product to replace */}
      <Form.Item
        name="orderItemId"
        label="Product to Substitute"
        rules={[{ required: true, message: "Please select a product" }]}
        extra="Choose the item in this order that needs a replacement"
      >
        <Select
          placeholder="Select a product"
          options={productOptions}
          onChange={handleProductChange}
          loading={loading}
          disabled={productOptions.length === 0}
          size="large"
          suffixIcon={<SwapOutlined />}
        />
      </Form.Item>

      {/* Row 2 — side by side: substitute qty (editable) | available qty (editable) */}
      <div className="sub-form-qty-row">
        {/* Left: how many to substitute — editable, pre-filled from ordered qty */}
        <Form.Item
          name="substituteQuantity"
          label="Substitute Quantity"
          rules={[
            { required: true, message: "Please enter substitute quantity" },
            {
              validator: (_, value) => {
                if (value && (isNaN(value) || Number(value) <= 0)) {
                  return Promise.reject("Must be greater than 0");
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input
            type="number"
            min={1}
            disabled={orderedQty === 0}
            size="large"
            placeholder={orderedQty > 0 ? `e.g. ${orderedQty}` : "Select a product first"}
          />
        </Form.Item>

        {/* Right: how many the seller can actually fulfil */}
        <Form.Item
          name="availableQuantity"
          label="Available Quantity"
          rules={[
            { required: true, message: "Please enter available quantity" },
            {
              validator: (_, value) => {
                const subQty = form.getFieldValue("substituteQuantity");
                if (value && subQty && Number(value) > Number(subQty)) {
                  return Promise.reject(
                    `Must not exceed substitute quantity (${subQty})`,
                  );
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input
            type="number"
            min={1}
            disabled={orderedQty === 0}
            size="large"
            placeholder={orderedQty > 0 ? `Max = substitute qty` : "Select a product first"}
          />
        </Form.Item>
      </div>

      {/* Row 3 — full width: reason */}
      <Form.Item
        name="remark"
        label="Your Remark"
        rules={[{ required: true, message: "Please enter a remark" }]}
      >
        <Input
          size="large"
          placeholder="e.g. Item out of stock, offering similar product"
        />
      </Form.Item>
    </>
  );
};

export default OrderSubstitutionForm;
