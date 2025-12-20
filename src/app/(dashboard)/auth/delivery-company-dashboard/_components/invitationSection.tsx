"use client";
import React, { useState } from "react";
import { Table, Button, Space, Tag, Modal, Input, message, Typography, Empty } from "antd";
import { ColumnsType } from "antd/es/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GET, POST } from "@/util/apicall";
import API from "@/config/API";
import Loading from "@/app/(dashboard)/_components/loading";
import Error from "@/app/(dashboard)/_components/error";

const { Text } = Typography;

interface Props {
  companyId: number;
}

function InvitationSection({ companyId }: Props) {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<{
    open: boolean;
    driverId?: number;
  }>({ open: false });
  const [messageText, setMessageText] = useState("");

  const { data: availableDrivers, isLoading, refetch } = useQuery({
    queryFn: ({ signal }) =>
      GET(`${API.DELIVERY_COMPANY_DRIVERS_AVAILABLE}${companyId}/drivers/available`, {}, signal),
    queryKey: ["available_drivers", companyId],
    enabled: !!companyId,
  });

  const sendInvitationMutation = useMutation({
    mutationFn: (payload: {
      driver_id: number;
      delivery_company_id: number;
      initiated_by: "company";
      message?: string;
    }) => POST(API.INVITATION_SEND, payload),
    onSuccess: (res: any) => {
      message.success(res?.message || "Invitation sent successfully");
      setModal({ open: false });
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["available_drivers", companyId] });
      queryClient.invalidateQueries({ queryKey: ["company_invitations", companyId] });
    },
    onError: (err: any) => {
      message.error(err?.message || err?.response?.data?.message || "Failed to send invitation");
    },
  });

  const handleSendInvitation = (driverId: number) => {
    setModal({ open: true, driverId });
  };

  const handleConfirm = () => {
    if (!modal.driverId) return;

    sendInvitationMutation.mutate({
      driver_id: modal.driverId,
      delivery_company_id: companyId,
      initiated_by: "company",
      message: messageText || undefined,
    });
  };

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
      title: "Status",
      key: "status",
      width: 150,
      render: (_, record) => {
        // Check if driver has pending invitation from this company
        if (record.hasPendingInvitation === true) {
          return <Tag color="orange">Invitation Sent</Tag>;
        }
        // Check if driver already accepted another company
        if (record.canInvite === false) {
          return <Tag color="red">Already Accepted</Tag>;
        }
        // Driver is available to invite
        return <Tag color="green">Available</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_, record) => {
        // Show button only if driver can be invited
        const canShowButton = record.canInvite === true && record.hasPendingInvitation !== true;

        if (!canShowButton) {
          return <Text type="secondary">-</Text>;
        }

        return (
          <Button
            type="primary"
            onClick={() => handleSendInvitation(record.id)}
          >
            Send Invitation
          </Button>
        );
      },
    },
  ];

  if (isLoading) return <Loading />;

  // Handle both nested and flat response structures
  const driversData = availableDrivers?.data?.data || availableDrivers?.data || [];

  // Count available drivers (can invite)
  const availableCount = driversData.filter((d: any) => d.canInvite && !d.hasPendingInvitation).length;
  const pendingCount = driversData.filter((d: any) => d.hasPendingInvitation).length;
  const acceptedCount = driversData.filter((d: any) => !d.canInvite).length;

  if (driversData.length === 0) {
    return <Empty description="No drivers registered in the system yet" />;
  }

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Text>
          Total Drivers: {driversData.length} |
          <Text type="success"> Available: {availableCount}</Text> |
          <Text type="warning"> Pending Invitation: {pendingCount}</Text> |
          <Text type="danger"> Already Accepted: {acceptedCount}</Text>
        </Text>
      </div>
      <Table
        columns={columns}
        dataSource={driversData}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Send Invitation to Driver"
        open={modal.open}
        onOk={handleConfirm}
        okText="Send Invitation"
        onCancel={() => {
          setModal({ open: false });
          setMessageText("");
        }}
        confirmLoading={sendInvitationMutation.isPending}
      >
        <div style={{ marginBottom: 16 }}>
          <p>Send an invitation to this driver to join your delivery company.</p>
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={{ fontWeight: 500, marginBottom: 4, display: 'block' }}>
            Greeting Message
          </label>
          <Input.TextArea
            placeholder="Write a greeting message for the driver (e.g., Hello! We would like to invite you to join our delivery team...)"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            rows={4}
            maxLength={500}
            showCount
          />
        </div>
      </Modal>
    </>
  );
}

export default InvitationSection;

