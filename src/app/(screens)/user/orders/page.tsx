"use client";
import React, { useEffect, useState } from "react";
import { List, Card, Spin, Typography, Empty } from "antd";
import { GET } from "@/util/apicall";
import API from "@/config/API";

const { Title, Text } = Typography;

interface UserOrder {
  id: number;
  userId: number;
  addressId: number;
  storeId: number;
  totalItems: number;
  paymentType: string;
  coupan: string;
  tax: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  grandTotal: number;
  status: string;
  order_id: number;
}

const UserOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await GET(API.ORDER_GET);
        if (Array.isArray(response)) {
          setOrders(response);
        } else if (Array.isArray(response?.data)) {
          setOrders(response.data);
        } else {
          setOrders([]);
        }
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>My Orders</Title>
      {loading ? (
        <Spin size="large" />
      ) : orders.length === 0 ? (
        <Empty description="No orders found." />
      ) : (
        <List
          grid={{ gutter: 16, column: 1 }}
          dataSource={orders}
          renderItem={(order) => (
            <List.Item>
              <Card title={`Order #${order.order_id}`}>
                <Text strong>Status:</Text> {order.status} <br />
                <Text strong>Total Items:</Text> {order.totalItems} <br />
                <Text strong>Grand Total:</Text> ₦{order.grandTotal} <br />
                <Text strong>Payment Type:</Text> {order.paymentType} <br />
                <Text strong>Store ID:</Text> {order.storeId} <br />
                <Text strong>Order ID:</Text> {order.id}
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default UserOrdersPage;
