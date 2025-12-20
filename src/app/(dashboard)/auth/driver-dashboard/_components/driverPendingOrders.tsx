"use client";
import React, { useState } from "react";
import { Table, Button, Tag, Modal, Form, Input, Upload, message, Typography, Descriptions } from "antd";
import { ColumnsType } from "antd/es/table";
import { UploadOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API from "@/config/API";
import Loading from "@/app/(dashboard)/_components/loading";
import { store } from "@/redux/store/store";
import type { UploadFile } from "antd/es/upload/interface";

const { Text } = Typography;

interface Props {
  driverId: number;
}

function DriverPendingOrders({ driverId }: Props) {
  const [deliveryModalVisible, setDeliveryModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const queryClient = useQueryClient();

  const { data: pendingOrders, isLoading } = useQuery({
    queryFn: ({ signal }) =>
      GET(`${API.DELIVERY_DRIVER_PENDING_ORDERS}${driverId}/orders/pending`, {}, signal),
    queryKey: ["driver_pending_orders", driverId],
    enabled: !!driverId,
  });

  const deliveryMutation = useMutation({
    mutationFn: async (values: { order_otp: string; image: File; description?: string }) => {
      const token = store.getState()?.Auth?.token ?? " ";
      const formData = new FormData();
      formData.append("driver_id", driverId.toString());
      formData.append("order_otp", values.order_otp);
      formData.append("image", values.image);
      if (values.description) {
        formData.append("description", values.description);
      }

      const response = await fetch(
        `${API.BASE_URL}${API.DELIVERY_ORDER_DELIVER}${selectedOrder.id}/deliver`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to confirm delivery");
      }

      return await response.json();
    },
    onSuccess: (res: any) => {
      message.success(res?.message || "Delivery confirmed successfully");
      setDeliveryModalVisible(false);
      form.resetFields();
      setFileList([]);
      queryClient.invalidateQueries({ queryKey: ["driver_pending_orders", driverId] });
      queryClient.invalidateQueries({ queryKey: ["driver_completed_orders", driverId] });
      queryClient.invalidateQueries({ queryKey: ["driver_orders", driverId] });
    },
    onError: (err: any) => {
      message.error(err?.message || "Failed to confirm delivery");
    },
  });

  const handleDeliveryConfirm = (order: any) => {
    setSelectedOrder(order);
    form.setFieldsValue({
      order_id: order.order_id,
    });
    setDeliveryModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (fileList.length === 0) {
        message.error("Please upload a delivery image");
        return;
      }
      const file = fileList[0].originFileObj;
      if (!file) {
        message.error("Please upload a valid image file");
        return;
      }
      deliveryMutation.mutate({
        order_otp: values.order_otp,
        image: file,
        description: values.description,
      });
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const columns: ColumnsType<any> = [
    {
      title: "Order ID",
      dataIndex: "order_id",
      key: "order_id",
      width: 120,
    },
    {
      title: "Customer",
      key: "customer",
      width: 200,
      render: (_, record) => record.userDetails?.name || record.userDetails?.email || "-",
    },
    {
      title: "Delivery Address",
      key: "address",
      width: 300,
      render: (_, record) => {
        const address = record.address;
        if (!address) return "-";
        return (
          <div>
            <Text strong>{address.full_name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {address.address_line}, {address.city}, {address.state}
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Phone: {address.phone}
            </Text>
          </div>
        );
      },
    },
    {
      title: "Total",
      dataIndex: "grandTotal",
      key: "grandTotal",
      width: 120,
      render: (value) => `$${value?.toFixed(2) || "0.00"}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const colorMap: Record<string, string> = {
          picked_up: "blue",
          out_for_delivery: "purple",
        };
        return <Tag color={colorMap[status] || "default"}>{status?.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handleDeliveryConfirm(record)}
        >
          Confirm Delivery
        </Button>
      ),
    },
  ];

  if (isLoading) return <Loading />;

  // Handle both nested and flat response structures
  const orders = pendingOrders?.data?.data || pendingOrders?.data || [];

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">
          Showing {orders.length} pending orders waiting for delivery
        </Text>
      </div>
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} orders`,
        }}
      />

      <Modal
        title="Confirm Delivery"
        open={deliveryModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setDeliveryModalVisible(false);
          form.resetFields();
          setFileList([]);
        }}
        confirmLoading={deliveryMutation.isPending}
        okText="Confirm Delivery"
        width={600}
      >
        {selectedOrder && (
          <div style={{ marginBottom: 16 }}>
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Order Number">
                <Text strong>{selectedOrder.order_id}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Delivery Address">
                {selectedOrder.address ? (
                  <>
                    <Text strong>{selectedOrder.address.full_name}</Text>
                    <br />
                    {selectedOrder.address.address_line}, {selectedOrder.address.city}, {selectedOrder.address.state}
                    <br />
                    Phone: {selectedOrder.address.phone}
                  </>
                ) : "-"}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
        <Form form={form} layout="vertical">
          <Form.Item label="Order Number" name="order_id">
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="Confirmation OTP"
            name="order_otp"
            rules={[
              { required: true, message: "OTP is required" },
              { len: 6, message: "OTP must be 6 digits" },
            ]}
            extra="Enter the 6-digit OTP provided by the customer"
          >
            <Input
              placeholder="Enter OTP from customer"
              maxLength={6}
              style={{ width: "100%" }}
            />
          </Form.Item>
          <Form.Item
            label="Delivery Image"
            rules={[{ required: true, message: "Please upload a delivery image" }]}
          >
            <Upload
              fileList={fileList}
              beforeUpload={(file) => {
                setFileList([file]);
                return false;
              }}
              onRemove={() => {
                setFileList([]);
              }}
              maxCount={1}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>Upload Image</Button>
            </Upload>
          </Form.Item>
          <Form.Item
            label="Description"
            name="description"
          >
            <Input.TextArea
              rows={3}
              placeholder="Enter delivery description (optional)"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default DriverPendingOrders;
