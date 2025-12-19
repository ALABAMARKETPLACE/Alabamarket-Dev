"use client";
import React from "react";
import { Table, Button, Space, Tag, message, Tooltip, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GET, POST } from "@/util/apicall";
import API from "@/config/API";
import Loading from "@/app/(dashboard)/_components/loading";
import Error from "@/app/(dashboard)/_components/error";

const { Text } = Typography;

interface Props {
  driverId: number;
}

function InvitationsList({ driverId }: Props) {
  const queryClient = useQueryClient();

  const { data: invitations, isLoading, refetch } = useQuery({
    queryFn: ({ signal }) =>
      GET(`${API.INVITATION_DRIVER}${driverId}`, {}, signal),
    queryKey: ["driver_invitations", driverId],
    enabled: !!driverId,
  });

  const acceptMutation = useMutation({
    mutationFn: (invitationId: number) =>
      POST(`${API.INVITATION_ACCEPT}${invitationId}/accept`, {}),
    onSuccess: (res: any) => {
      message.success(res?.message || "Invitation accepted successfully");
      queryClient.invalidateQueries({ queryKey: ["driver_invitations", driverId] });
    },
    onError: (err: any) => {
      message.error(err?.message || err?.response?.data?.message || "Failed to accept invitation");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (invitationId: number) =>
      POST(`${API.INVITATION_REJECT}${invitationId}/reject`, {}),
    onSuccess: (res: any) => {
      message.success(res?.message || "Invitation rejected successfully");
      queryClient.invalidateQueries({ queryKey: ["driver_invitations", driverId] });
    },
    onError: (err: any) => {
      message.error(err?.message || err?.response?.data?.message || "Failed to reject invitation");
    },
  });

  const columns: ColumnsType<any> = [
    {
      title: "Company Name",
      key: "company_name",
      width: 200,
      render: (_, record) => record.company?.business_name || "-",
    },
    {
      title: "Email",
      key: "email",
      width: 200,
      render: (_, record) => record.company?.user?.email || "-",
    },
    {
      title: "Phone",
      key: "phone",
      width: 150,
      render: (_, record) => record.company?.phone || "-",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const colorMap: Record<string, string> = {
          pending: "orange",
          accepted: "green",
          rejected: "red",
          cancelled: "default",
        };
        return <Tag color={colorMap[status] || "default"}>{status?.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Initiated By",
      dataIndex: "initiated_by",
      key: "initiated_by",
      width: 120,
      render: (by) => <Tag>{by === "driver" ? "You" : "Company"}</Tag>,
    },
    {
      title: "Greeting Message",
      dataIndex: "message",
      key: "message",
      width: 250,
      render: (msg) => {
        if (!msg) return <Text type="secondary">No message</Text>;
        return (
          <Tooltip title={msg} placement="topLeft">
            <Text ellipsis style={{ maxWidth: 230 }}>{msg}</Text>
          </Tooltip>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_, record) => {
        // Driver can only accept/reject invitations initiated by company
        // If driver initiated the request, they must wait for company to accept/reject
        if (record.status === "pending" && record.initiated_by === "company") {
          return (
            <Space>
              <Button
                type="primary"
                size="small"
                onClick={() => acceptMutation.mutate(record.id)}
                loading={acceptMutation.isPending}
              >
                Accept
              </Button>
              <Button
                danger
                size="small"
                onClick={() => rejectMutation.mutate(record.id)}
                loading={rejectMutation.isPending}
              >
                Reject
              </Button>
            </Space>
          );
        }
        if (record.status === "pending" && record.initiated_by === "driver") {
          return <Text type="secondary">Waiting for company</Text>;
        }
        return <span>-</span>;
      },
    },
  ];

  if (isLoading) return <Loading />;

  // Handle both nested and flat response structures
  const invitationsData = invitations?.data?.data || invitations?.data || [];

  return (
    <Table
      columns={columns}
      dataSource={invitationsData}
      rowKey="id"
      pagination={false}
    />
  );
}

export default InvitationsList;

