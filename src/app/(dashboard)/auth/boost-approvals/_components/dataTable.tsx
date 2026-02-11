"use client";
import React, { useMemo, useState, useEffect } from "react";
import {
  Button,
  Modal,
  Pagination,
  Space,
  Table,
  Typography,
  Input,
  message,
  InputNumber,
  Tooltip,
} from "antd";
import { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { POST, PUT } from "@/util/apicall";
import API_ADMIN from "@/config/API_ADMIN";
import {
  FiEye,
  FiCheck,
  FiX,
  FiZap,
  FiUser,
  FiCalendar,
  FiPackage,
  FiClock,
  FiDollarSign,
} from "react-icons/fi";

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
  const [isMobile, setIsMobile] = useState(false);
  const [modal, setModal] = useState<{
    open: boolean;
    id?: number;
    action?: "approved" | "rejected";
  }>({ open: false });
  const [remarks, setRemarks] = useState<string>("");
  const [priorityDraft, setPriorityDraft] = useState<Record<number, number>>(
    {},
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
    switch (status) {
      case "pending":
        return (
          <span className="dashboard-badge dashboard-badge--warning">
            {status.toUpperCase()}
          </span>
        );
      case "approved":
        return (
          <span className="dashboard-badge dashboard-badge--success">
            {status.toUpperCase()}
          </span>
        );
      case "rejected":
        return (
          <span className="dashboard-badge dashboard-badge--danger">
            {status.toUpperCase()}
          </span>
        );
      default:
        return (
          <span className="dashboard-badge dashboard-badge--default">
            {status.toUpperCase()}
          </span>
        );
    }
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
            <Tooltip title="View details">
              <Button
                size="small"
                icon={<FiEye size={14} />}
                onClick={() =>
                  router.push(`/auth/boost-approvals/${record.id}`)
                }
              />
            </Tooltip>
            <Tooltip title="Approve">
              <Button
                size="small"
                type="primary"
                icon={<FiCheck size={14} />}
                disabled={record.status !== "pending"}
                onClick={() =>
                  setModal({ open: true, id: record.id, action: "approved" })
                }
              />
            </Tooltip>
            <Tooltip title="Reject">
              <Button
                size="small"
                danger
                icon={<FiX size={14} />}
                disabled={record.status !== "pending"}
                onClick={() =>
                  setModal({ open: true, id: record.id, action: "rejected" })
                }
              />
            </Tooltip>
          </Space>
        ),
      },
    ],
    [priorityDraft, mutationPriority.isPending, router],
  );

  const MobileCardView = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return (
        <div className="dashboard-mobile-card__empty">
          <FiZap size={48} />
          <p>No boost approvals yet</p>
        </div>
      );
    }

    return data.map((record) => (
      <div className="dashboard-mobile-card" key={record.id}>
        <div className="dashboard-mobile-card__header">
          <div
            className="dashboard-mobile-card__avatar dashboard-mobile-card__avatar--icon"
            style={{ backgroundColor: "#fff7e6" }}
          >
            <FiZap size={24} color="#fa8c16" />
          </div>
          <div className="dashboard-mobile-card__info">
            <h4 className="dashboard-mobile-card__title">
              Request #{record.id}
            </h4>
            <span className="dashboard-mobile-card__subtitle">
              <FiUser size={12} /> {record?.seller?.name || "-"}
            </span>
          </div>
          {statusTag(record.status)}
        </div>
        <div className="dashboard-mobile-card__body">
          <div className="dashboard-mobile-card__row">
            <span className="dashboard-mobile-card__label">
              <FiZap size={14} /> Plan
            </span>
            <span className="dashboard-mobile-card__value">
              {record?.plan?.name || "-"}
            </span>
          </div>
          <div className="dashboard-mobile-card__row">
            <span className="dashboard-mobile-card__label">
              <FiPackage size={14} /> Products
            </span>
            <span className="dashboard-mobile-card__value">
              {record?.product_ids?.length || 0}
            </span>
          </div>
          <div className="dashboard-mobile-card__row">
            <span className="dashboard-mobile-card__label">
              <FiClock size={14} /> Days
            </span>
            <span className="dashboard-mobile-card__value">{record.days}</span>
          </div>
          <div className="dashboard-mobile-card__row">
            <span className="dashboard-mobile-card__label">
              <FiDollarSign size={14} /> Total
            </span>
            <span className="dashboard-mobile-card__value dashboard-mobile-card__value--highlight">
              ₦{Number(record.total_amount).toFixed(2)}
            </span>
          </div>
          {record.status === "approved" && (
            <div className="dashboard-mobile-card__row">
              <span className="dashboard-mobile-card__label">Priority</span>
              <Space size={8}>
                <InputNumber
                  size="small"
                  min={0}
                  value={
                    priorityDraft[record.id] ?? record.boost_priority ?? 100
                  }
                  onChange={(v) =>
                    setPriorityDraft((prev) => ({
                      ...prev,
                      [record.id]: Number(v ?? 0),
                    }))
                  }
                  style={{ width: 70 }}
                />
                <Button
                  size="small"
                  loading={mutationPriority.isPending}
                  onClick={() => {
                    const value =
                      priorityDraft[record.id] ?? record.boost_priority ?? 100;
                    mutationPriority.mutate({
                      id: record.id,
                      priority: Number(value),
                    });
                  }}
                >
                  Save
                </Button>
              </Space>
            </div>
          )}
        </div>
        <div className="dashboard-mobile-card__actions">
          <Button
            type="primary"
            ghost
            icon={<FiEye size={14} />}
            size="small"
            onClick={() => router.push(`/auth/boost-approvals/${record.id}`)}
          >
            View
          </Button>
          <Button
            type="primary"
            icon={<FiCheck size={14} />}
            size="small"
            disabled={record.status !== "pending"}
            onClick={() =>
              setModal({ open: true, id: record.id, action: "approved" })
            }
          >
            Approve
          </Button>
          <Button
            danger
            icon={<FiX size={14} />}
            size="small"
            disabled={record.status !== "pending"}
            onClick={() =>
              setModal({ open: true, id: record.id, action: "rejected" })
            }
          >
            Reject
          </Button>
        </div>
      </div>
    ));
  }, [data, priorityDraft, mutationPriority.isPending, router]);

  return (
    <div className="dashboard-table-container">
      {!isMobile ? (
        <Table
          rowKey="id"
          dataSource={data}
          columns={columns}
          pagination={false}
          size="small"
          scroll={{ x: 1200 }}
          locale={{
            emptyText: (
              <div className="dashboard-mobile-card__empty">
                <FiZap size={48} />
                <p>No boost approvals yet</p>
              </div>
            ),
          }}
        />
      ) : (
        <div className="dashboard-mobile-cards">{MobileCardView}</div>
      )}
      <div className="table__pagination-container">
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
