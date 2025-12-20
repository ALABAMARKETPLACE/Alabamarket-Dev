"use client";
import React, { useState } from "react";
import { Table, Button, Modal, Form, Input, Select, Upload, message, Tag, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { UploadOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API from "@/config/API";
import { store } from "@/redux/store/store";
import Loading from "@/app/(dashboard)/_components/loading";
import type { UploadFile } from "antd/es/upload/interface";

interface Props {
  companyId: number;
}

function PickupModule({ companyId }: Props) {
  const [pickupModalVisible, setPickupModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const queryClient = useQueryClient();

  const { data: companyDrivers } = useQuery({
    queryFn: ({ signal }) =>
      GET(`${API.DELIVERY_COMPANY_DRIVERS}${companyId}/drivers?approvedOnly=true`, {}, signal),
    queryKey: ["company_drivers", companyId],
    enabled: !!companyId,
  });

  const { data: acceptedOrders, isLoading } = useQuery({
    queryFn: ({ signal }) =>
      GET(`delivery/company/${companyId}/orders/accepted-with-drivers`, {}, signal),
    queryKey: ["accepted_orders_with_drivers", companyId],
    enabled: !!companyId,
  });

  const pickupMutation = useMutation({
    mutationFn: async (values: { driver_id: number; pickup_code: string; image: File; description?: string }) => {
      const token = store.getState()?.Auth?.token ?? " ";
      const formData = new FormData();
      formData.append("company_id", companyId.toString());
      formData.append("driver_id", values.driver_id.toString());
      formData.append("pickup_code", values.pickup_code);
      formData.append("image", values.image);
      if (values.description) {
        formData.append("description", values.description);
      }

      const response = await fetch(
        `${API.BASE_URL}${API.DELIVERY_ORDER_PICKUP}${selectedOrder.id}/pickup`,
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
        throw new Error(errorData.message || "Failed to confirm pickup");
      }

      return await response.json();
    },
    onSuccess: (res: any) => {
      message.success(res?.message || "Pickup confirmed successfully");
      setPickupModalVisible(false);
      form.resetFields();
      setFileList([]);
      queryClient.invalidateQueries({ queryKey: ["accepted_orders_with_drivers", companyId] });
      queryClient.invalidateQueries({ queryKey: ["company_orders", companyId] });
    },
    onError: (err: any) => {
      message.error(err?.response?.data?.message || err?.message || "Failed to confirm pickup");
    },
  });

  const handlePickup = (order: any) => {
    setSelectedOrder(order);
    form.setFieldsValue({
      order_id: order.order_id,
      pickup_code: order.pickup_code || '',
      driver_id: order.primary_driver?.driver_id || undefined,
    });
    setPickupModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (fileList.length === 0) {
        message.error("Please upload a product image");
        return;
      }
      const file = fileList[0].originFileObj;
      if (!file) {
        message.error("Please upload a valid image file");
        return;
      }
      pickupMutation.mutate({
        driver_id: values.driver_id,
        pickup_code: values.pickup_code,
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
      title: "Total",
      dataIndex: "grandTotal",
      key: "grandTotal",
      width: 120,
      render: (value) => `$${value?.toFixed(2) || "0.00"}`,
    },
    {
      title: "Pickup Code",
      dataIndex: "pickup_code",
      key: "pickup_code",
      width: 120,
      render: (code) => code || "-",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const colorMap: Record<string, string> = {
          out_for_delivery: "purple",
          picked_up: "green",
        };
        return <Tag color={colorMap[status] || "default"}>{status?.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Assigned Driver",
      key: "assigned_driver",
      width: 200,
      render: (_, record) => {
        if (record.primary_driver) {
          return (
            <div>
              <strong>{record.primary_driver.driver_name}</strong>
              <br />
              <small>{record.primary_driver.driver_phone}</small>
            </div>
          );
        }
        return (
          <Tag color="orange">
            {record.assigned_drivers?.length || 0} drivers available
          </Tag>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handlePickup(record)}
          disabled={record.status === "picked_up"}
        >
          Pickup
        </Button>
      ),
    },
  ];

  if (isLoading) return <Loading />;

  return (
    <>
      <Table
        columns={columns}
        dataSource={acceptedOrders?.data?.data || []}
        rowKey="id"
        pagination={false}
      />

      <Modal
        title="Confirm Pickup"
        open={pickupModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setPickupModalVisible(false);
          form.resetFields();
          setFileList([]);
        }}
        confirmLoading={pickupMutation.isPending}
        okText="Confirm Pickup"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Order Number" name="order_id">
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="Pickup Code"
            name="pickup_code"
            rules={[{ required: true, message: "Pickup code is required" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Select Driver"
            name="driver_id"
            rules={[{ required: true, message: "Please select a driver" }]}
          >
            <Select
              placeholder="Select driver who is picking up"
              onChange={(value) => setSelectedDriver(value)}
            >
              {companyDrivers?.data?.data?.map((driver: any) => (
                <Select.Option key={driver.id} value={driver.id}>
                  {driver.full_name} - {driver.phone}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Product Upload Image"
            rules={[{ required: true, message: "Please upload a product image" }]}
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
              placeholder="Enter pickup description (optional)"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default PickupModule;

