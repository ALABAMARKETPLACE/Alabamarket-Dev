"use client";
import React from "react";
import { Table, Tag, message } from "antd";
import { ColumnsType } from "antd/es/table";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API from "@/config/API";
import Loading from "@/app/(dashboard)/_components/loading";

interface Props {
  companyId: number;
}

function AcceptedOrders({ companyId }: Props) {
  const { data: acceptedOrders, isLoading } = useQuery({
    queryFn: ({ signal }) =>
      GET(`delivery/company/${companyId}/orders/accepted-with-drivers`, {}, signal),
    queryKey: ["accepted_orders_with_drivers", companyId],
    enabled: !!companyId,
  });

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
      title: "Order OTP",
      dataIndex: "order_otp",
      key: "order_otp",
      width: 120,
      render: (otp) => otp || "-",
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
      title: "Assigned Drivers",
      key: "assigned_drivers",
      width: 250,
      render: (_, record) => {
        if (record.primary_driver) {
          return (
            <div>
              <Tag color="green">PRIMARY</Tag>
              <br />
              <strong>{record.primary_driver.driver_name}</strong>
              <br />
              <small>{record.primary_driver.driver_phone}</small>
            </div>
          );
        }

        if (record.assigned_drivers && record.assigned_drivers.length > 0) {
          return (
            <div>
              {record.assigned_drivers.map((driver: any, index: number) => (
                <div key={index} style={{ marginBottom: 4 }}>
                  <Tag color="blue">{driver.driver_name}</Tag>
                  <small>{driver.driver_phone}</small>
                </div>
              ))}
            </div>
          );
        }

        return <Tag color="orange">No drivers assigned</Tag>;
      },
    },
  ];

  if (isLoading) return <Loading />;

  // Handle both nested and flat response structures
  const orders = acceptedOrders?.data?.data || acceptedOrders?.data || [];

  return (
    <Table
      columns={columns}
      dataSource={orders}
      rowKey="id"
      pagination={false}
    />
  );
}

export default AcceptedOrders;

