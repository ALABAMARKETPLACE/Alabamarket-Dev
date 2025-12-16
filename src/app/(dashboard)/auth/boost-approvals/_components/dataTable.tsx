"use client";
import React, { useMemo, useState } from "react";
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
  InputNumber,
} from "antd";
import { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { POST, PUT } from "@/util/apicall";
import API_ADMIN from "@/config/API_ADMIN";

type BoostRequestRow = {
  id: number;
  seller?: { id: number; name: string; email?: string };
  plan?: { id: number; name: string; price_per_day?: number };
  product_ids: number[];
  days: number;
  total_amount: number;
  status: "pending" | "approved" | "rejected" | "expired";
  requested_at?: string;
  approved_at?: string;
  boost_priority?: number;
};

interface Props {
  data: BoostRequestRow[];
  count?: number;
  page: number;
  pageSize: number;
  setPage: (n: number) => void;
  setTake: (n: number) => void;
}

function DataTable({
  data,
  count = 0,
  page,
  pageSize,
  setPage,
  setTake,
}: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<{
    open: boolean;
    id?: number;
    action?: "approved" | "rejected";
  }>({ open: false });
  const [remarks, setRemarks] = useState<string>("");
  const [priorityDraft, setPriorityDraft] = useState<Record<number, number>>(
    {}
  );

  const mutationApprove = useMutation({
    mutationFn: (payload: {
      id: number;
      status: "approved" | "rejected";
      remarks?: string;
    }) => POST(API_ADMIN.BOOST_REQUEST_APPROVE, payload),
    onSuccess: () => {
      setModal({ open: false });
      setRemarks("");
      queryClient.invalidateQueries({ queryKey: ["boost_requests_admin"] });
    },
  });

  const mutationPriority = useMutation({
    mutationFn: (payload: { id: number; priority: number }) =>
      PUT(API_ADMIN.BOOST_REQUEST_PRIORITY, payload),
    onSuccess: async (res: any) => {
      message.success(res?.message ?? "Priority updated successfully");
      if (res?.data?.id) {
        setPriorityDraft((prev) => {
          const next = { ...prev };
          delete next[res.data.id];
          return next;
        });
      }
      await queryClient.invalidateQueries({
        queryKey: ["boost_requests_admin"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["boost_request_admin_detail", res?.data?.id],
      });
    },
    onError: (err: any) => {
      const errorMessage =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to update priority";
      message.error(errorMessage);
    },
  });

  const statusTag = (status: BoostRequestRow["status"]) => {
    const color =
      status === "pending"
        ? "orange"
        : status === "approved"
        ? "green"
        : status === "rejected"
        ? "red"
        : "default";
    return <Tag color={color}>{status.toUpperCase()}</Tag>;
  };

  const columns: ColumnsType<BoostRequestRow> = useMemo(
    () => [
      { title: "ID", dataIndex: "id", key: "id", width: 80 },
      {
        title: "Seller",
        key: "seller",
        render: (_, r) => <span>{r?.seller?.name || "-"}</span>,
      },
      {
        title: "Plan",
        key: "plan",
        render: (_, r) => <span>{r?.plan?.name || "-"}</span>,
      },
      {
        title: "Products",
        key: "products",
        render: (_, r) => <span>{r?.product_ids?.length || 0}</span>,
      },
      { title: "Days", dataIndex: "days", key: "days", width: 90 },
      {
        title: "Total",
        dataIndex: "total_amount",
        key: "total_amount",
        render: (v) => <span>₦{Number(v).toFixed(2)}</span>,
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (v) => statusTag(v),
      },
      { title: "Requested At", dataIndex: "requested_at", key: "requested_at" },
      {
        title: "Priority",
        key: "priority",
        render: (_, r) => (
          <Space size={8}>
            <InputNumber
              size="small"
              min={0}
              value={priorityDraft[r.id] ?? r.boost_priority ?? 100}
              onChange={(v) =>
                setPriorityDraft((prev) => ({
                  ...prev,
                  [r.id]: Number(v ?? 0),
                }))
              }
              disabled={r.status !== "approved"}
              style={{ width: 90 }}
            />
            <Button
              size="small"
              disabled={r.status !== "approved"}
              loading={mutationPriority.isPending}
              onClick={() => {
                const value = priorityDraft[r.id] ?? r.boost_priority ?? 100;
                mutationPriority.mutate({ id: r.id, priority: Number(value) });
              }}
            >
              Save
            </Button>
          </Space>
        ),
      },
      {
        title: "Actions",
        key: "actions",
        render: (_, record) => (
          <Space>
            <Button
              size="small"
              onClick={() => router.push(`/auth/boost-approvals/${record.id}`)}
            >
              View
            </Button>
            <Button
              size="small"
              type="primary"
              disabled={record.status !== "pending"}
              onClick={() =>
                setModal({ open: true, id: record.id, action: "approved" })
              }
            >
              Approve
            </Button>
            <Button
              size="small"
              danger
              disabled={record.status !== "pending"}
              onClick={() =>
                setModal({ open: true, id: record.id, action: "rejected" })
              }
            >
              Reject
            </Button>
          </Space>
        ),
      },
    ],
    [priorityDraft, mutationPriority.isPending]
  );

  return (
    <div style={{ overflowX: "auto" }}>
      <Table
        rowKey="id"
        dataSource={data}
        columns={columns}
        pagination={false}
        size="small"
      />
      <div style={{ display: "flex", justifyContent: "flex-end", padding: 12 }}>
        <Pagination
          current={page}
          pageSize={pageSize}
          onChange={(p, s) => {
            setPage(p);
            setTake(s);
          }}
          total={count || 0}
          showSizeChanger
        />
      </div>

      <Modal
        title={
          modal.action === "approved"
            ? "Approve Boost Request"
            : "Reject Boost Request"
        }
        open={modal.open}
        onCancel={() => {
          setModal({ open: false });
          setRemarks("");
        }}
        okText={modal.action === "approved" ? "Approve" : "Reject"}
        okButtonProps={{
          loading: mutationApprove.isPending,
          danger: modal.action === "rejected",
        }}
        onOk={() => {
          if (!modal.id || !modal.action) return;
          mutationApprove.mutate({
            id: modal.id,
            status: modal.action,
            remarks: remarks || undefined,
          });
        }}
      >
        <Typography.Paragraph>
          This action will set the status to <b>{modal.action}</b>.
        </Typography.Paragraph>
        <Input.TextArea
          rows={4}
          placeholder="Remarks (optional)"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
      </Modal>
    </div>
  );
}

export default DataTable;
