"use client";
import React, { useState } from "react";
import {
  Button,
  Modal,
  Pagination,
  Space,
  Table,
  Tag,
  Typography,
  Input,
  message,
} from "antd";
import { ColumnsType } from "antd/es/table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PUT } from "@/util/apicall";
import API_ADMIN from "@/config/API_ADMIN";

type DriverRow = {
  id: number;
  full_name: string;
  phone: string;
  state: string;
  city: string;
  license_number: string;
  status: "pending" | "approved" | "rejected" | "active" | "suspended" | "inactive";
  status_remark?: string;
  user?: { _id: number; name: string; email: string; phone: string };
  createdAt?: string;
};

interface Props {
  data: DriverRow[];
  count?: number;
  page: number;
  pageSize: number;
  setPage: (n: number) => void;
  setTake: (n: number) => void;
  status: string;
}

function DriverTable({
  data,
  count = 0,
  page,
  pageSize,
  setPage,
  setTake,
  status,
}: Props) {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<{
    open: boolean;
    id?: number;
    action?: "approved" | "rejected";
  }>({ open: false });
  const [remarks, setRemarks] = useState<string>("");

  const mutationApprove = useMutation({
    mutationFn: (payload: {
      id: number;
      status: "approved" | "rejected";
      remark?: string;
    }) => PUT(`${API_ADMIN.DRIVER_UPDATE_STATUS}${payload.id}/status`, { status: payload.status, remark: payload.remark }),
    onSuccess: (res: any) => {
      message.success(res?.message || "Status updated successfully");
      setModal({ open: false });
      setRemarks("");
      queryClient.invalidateQueries({ queryKey: ["drivers_admin"] });
    },
    onError: (err: any) => {
      const errorMessage =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to update status";
      message.error(errorMessage);
    },
  });

  const statusTag = (status: DriverRow["status"]) => {
    const colorMap: Record<string, string> = {
      pending: "orange",
      approved: "green",
      rejected: "red",
      active: "blue",
      suspended: "purple",
      inactive: "default",
    };
    return <Tag color={colorMap[status] || "default"}>{status.toUpperCase()}</Tag>;
  };

  const handleApprove = (id: number) => {
    setModal({ open: true, id, action: "approved" });
  };

  const handleReject = (id: number) => {
    setModal({ open: true, id, action: "rejected" });
  };

  const handleConfirm = () => {
    if (!modal.id || !modal.action) return;

    mutationApprove.mutate({
      id: modal.id,
      status: modal.action,
      remark: remarks || undefined,
    });
  };

  const columns: ColumnsType<DriverRow> = [
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
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => statusTag(status),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_, record) => {
        if (record.status === "pending") {
          return (
            <Space>
              <Button
                type="primary"
                size="small"
                onClick={() => handleApprove(record.id)}
              >
                Approve
              </Button>
              <Button
                danger
                size="small"
                onClick={() => handleReject(record.id)}
              >
                Reject
              </Button>
            </Space>
          );
        }
        return <Typography.Text type="secondary">-</Typography.Text>;
      },
    },
  ];

  // Filter data based on status if needed (backend should handle this, but client-side fallback)
  const filteredData = data;

  return (
    <>
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        pagination={false}
        scroll={{ x: 1000 }}
      />
      <div style={{ marginTop: 16, textAlign: "right" }}>
        <Pagination
          current={page}
          pageSize={pageSize}
          total={count}
          onChange={(p, s) => {
            setPage(p);
            setTake(s);
          }}
          showSizeChanger
          showTotal={(total) => `Total ${total} items`}
        />
      </div>

      <Modal
        title={`${modal.action === "approved" ? "Approve" : "Reject"} Driver`}
        open={modal.open}
        onOk={handleConfirm}
        onCancel={() => {
          setModal({ open: false });
          setRemarks("");
        }}
        confirmLoading={mutationApprove.isPending}
      >
        <div style={{ marginBottom: 16 }}>
          <Typography.Text>
            Are you sure you want to {modal.action === "approved" ? "approve" : "reject"} this driver?
          </Typography.Text>
        </div>
        <Input.TextArea
          placeholder="Add remarks (optional)"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          rows={4}
        />
      </Modal>
    </>
  );
}

export default DriverTable;

