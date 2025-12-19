"use client";
import React, { useState } from "react";
import { Table, Button, Modal, Input, message } from "antd";
import { ColumnsType } from "antd/es/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GET, POST } from "@/util/apicall";
import API from "@/config/API";
import Loading from "@/app/(dashboard)/_components/loading";
import Error from "@/app/(dashboard)/_components/error";

interface Props {
  driverId: number;
}

function CompanyList({ driverId }: Props) {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<{
    open: boolean;
    companyId?: number;
  }>({ open: false });
  const [messageText, setMessageText] = useState("");

  const { data: companies, isLoading } = useQuery({
    queryFn: ({ signal }) =>
      GET(API.DELIVERY_COMPANIES_APPROVED, {}, signal),
    queryKey: ["approved_companies"],
  });

  const sendInvitationMutation = useMutation({
    mutationFn: (payload: {
      driver_id: number;
      delivery_company_id: number;
      initiated_by: "driver";
      message?: string;
    }) => POST(API.INVITATION_SEND, payload),
    onSuccess: (res: any) => {
      message.success(res?.message || "Request sent successfully");
      setModal({ open: false });
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["driver_invitations", driverId] });
    },
    onError: (err: any) => {
      message.error(err?.message || err?.response?.data?.message || "Failed to send request");
    },
  });

  const handleSendRequest = (companyId: number) => {
    setModal({ open: true, companyId });
  };

  const handleConfirm = () => {
    if (!modal.companyId) return;

    sendInvitationMutation.mutate({
      driver_id: driverId,
      delivery_company_id: modal.companyId,
      initiated_by: "driver",
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
      title: "Business Name",
      dataIndex: "business_name",
      key: "business_name",
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
      title: "Location",
      key: "location",
      width: 200,
      render: (_, record) => `${record.city}, ${record.state}`,
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handleSendRequest(record.id)}
        >
          Send Request
        </Button>
      ),
    },
  ];

  if (isLoading) return <Loading />;

  // Handle both nested and flat response structures
  const companiesData = companies?.data?.data || companies?.data || [];

  return (
    <>
      <Table
        columns={columns}
        dataSource={companiesData}
        rowKey="id"
        pagination={false}
      />

      <Modal
        title="Send Request to Delivery Company"
        open={modal.open}
        onOk={handleConfirm}
        onCancel={() => {
          setModal({ open: false });
          setMessageText("");
        }}
        confirmLoading={sendInvitationMutation.isPending}
      >
        <div style={{ marginBottom: 16 }}>
          <p>Are you sure you want to send a request to this delivery company?</p>
        </div>
        <Input.TextArea
          placeholder="Add a message (optional)"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          rows={4}
        />
      </Modal>
    </>
  );
}

export default CompanyList;

