"use client";
import React, { useState } from "react";
import { Tabs, Table, Tag, Space, Button, message } from "antd";
import { ColumnsType } from "antd/es/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GET, POST } from "@/util/apicall";
import API from "@/config/API";
import Loading from "@/app/(dashboard)/_components/loading";
import Error from "@/app/(dashboard)/_components/error";

interface Props {
  companyId: number;
}

function DriverList({ companyId }: Props) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("all");

  // Fetch all drivers with invitations for this company
  const { data: allDrivers, isLoading: isLoadingAll } = useQuery({
    queryFn: ({ signal }) =>
      GET(`${API.DELIVERY_COMPANY_DRIVERS}${companyId}/drivers?approvedOnly=false`, {}, signal),
    queryKey: ["company_drivers_all", companyId],
    enabled: !!companyId,
  });

  // Fetch only approved (accepted invitation) drivers for this company
  const { data: approvedDrivers, isLoading: isLoadingApproved } = useQuery({
    queryFn: ({ signal }) =>
      GET(`${API.DELIVERY_COMPANY_DRIVERS}${companyId}/drivers?approvedOnly=true`, {}, signal),
    queryKey: ["company_drivers_approved", companyId],
    enabled: !!companyId,
  });

  const columns: ColumnsType<any> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Full Name",
      dataIndex: "full_name",
      key: "full_name",
      width: 200,
    },
    {
      title: "Email",
      dataIndex: ["user", "email"],
      key: "email",
      width: 200,
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      width: 150,
    },
    {
      title: "License Number",
      dataIndex: "license_number",
      key: "license_number",
      width: 150,
    },
    {
      title: "Location",
      key: "location",
      width: 200,
      render: (_, record) => `${record.city}, ${record.state}`,
    },
    {
      title: "Invitation Status",
      key: "invitation_status",
      width: 150,
      render: (_, record) => {
        const status = record.invitation?.status;
        const colorMap: Record<string, string> = {
          pending: "orange",
          accepted: "green",
          rejected: "red",
          cancelled: "default",
        };
        return status ? (
          <Tag color={colorMap[status] || "default"}>{status.toUpperCase()}</Tag>
        ) : (
          <Tag>-</Tag>
        );
      },
    },
  ];

  // Handle both nested and flat response structures
  const allDriversData = allDrivers?.data?.data || allDrivers?.data || [];
  const approvedDriversData = approvedDrivers?.data?.data || approvedDrivers?.data || [];

  const tabItems = [
    {
      key: "all",
      label: `All Drivers (${allDriversData.length})`,
      children: (
        <>
          {isLoadingAll ? (
            <Loading />
          ) : (
            <Table
              columns={columns}
              dataSource={allDriversData}
              rowKey="id"
              pagination={false}
            />
          )}
        </>
      ),
    },
    {
      key: "approved",
      label: `Approved Drivers (${approvedDriversData.length})`,
      children: (
        <>
          {isLoadingApproved ? (
            <Loading />
          ) : (
            <Table
              columns={columns}
              dataSource={approvedDriversData}
              rowKey="id"
              pagination={false}
            />
          )}
        </>
      ),
    },
  ];

  return (
    <Tabs
      activeKey={activeTab}
      onChange={setActiveTab}
      items={tabItems}
    />
  );
}

export default DriverList;

