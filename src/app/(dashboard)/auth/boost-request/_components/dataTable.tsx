"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Button, Table, Pagination, Popconfirm, notification, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { FiEye, FiEdit2, FiTrash2, FiZap, FiCalendar, FiPackage, FiClock, FiDollarSign, FiUser } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DELETE } from "@/util/apicall";
import API_ADMIN from "@/config/API_ADMIN";
import moment from "moment";
import "../styles.scss";

interface Seller {
  name?: string;
}

interface Plan {
  name?: string;
}

export interface BoostRequest {
  id: number;
  _id?: number;
  seller?: Seller;
  plan?: Plan;
  product_ids?: number[];
  days?: number;
  total_amount?: number;
  status?: string;
  start_date?: string;
  end_date?: string;
}

interface props {
  data: BoostRequest[];
  count: number;
  setPage: (page: number) => void;
  setTake: (take: number) => void;
  pageSize: number;
  page: number;
}

function DataTable({ data, count, setPage, setTake, pageSize, page }: props) {
  const router = useRouter();
  const [Notifications, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();
  const [isMobile, setIsMobile] = useState(false);

  const mutationDelete = useMutation({
    mutationFn: (id: number) => {
      return DELETE(API_ADMIN.BOOST_REQUESTS + id);
    },
    onError: (error: Error) => {
      Notifications["error"]({
        message: error.message || "Failed to delete boost request",
      });
    },
    onSuccess: () => {
      Notifications["success"]({
        message: "Boost request deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["boost_requests"] });
    },
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="dashboard-badge dashboard-badge--warning">{status?.toUpperCase()}</span>;
      case "approved":
        return <span className="dashboard-badge dashboard-badge--success">{status?.toUpperCase()}</span>;
      case "rejected":
        return <span className="dashboard-badge dashboard-badge--danger">{status?.toUpperCase()}</span>;
      case "expired":
        return <span className="dashboard-badge dashboard-badge--default">{status?.toUpperCase()}</span>;
      default:
        return <span className="dashboard-badge dashboard-badge--default">{status?.toUpperCase() || "UNKNOWN"}</span>;
    }
  };

  const renderDesktopActions = (id: number, record: BoostRequest) => (
    <div className="table-action">
      <Tooltip title="View details">
        <Button
          type="text"
          size="small"
          onClick={() => router.push(`/auth/boost-request/${id}`)}
          icon={<FiEye size={16} color="#1890ff" />}
        />
      </Tooltip>
      {record.status === "pending" && (
        <Tooltip title="Edit">
          <Button
            type="text"
            size="small"
            onClick={() => router.push(`/auth/boost-request/${id}/edit`)}
            icon={<FiEdit2 size={16} color="#1890ff" />}
          />
        </Tooltip>
      )}
      <Popconfirm
        title="Delete Boost Request"
        description="Are you sure you want to delete this boost request?"
        onConfirm={() => mutationDelete.mutate(id)}
        okText="Yes, Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <Tooltip title="Delete">
          <Button
            type="text"
            size="small"
            danger
            loading={mutationDelete.isPending && mutationDelete.variables === id}
            icon={<FiTrash2 size={16} />}
          />
        </Tooltip>
      </Popconfirm>
    </div>
  );

  const columns: ColumnsType<BoostRequest> = [
    {
      title: "Request ID",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "Seller Name",
      dataIndex: "seller",
      key: "seller",
      render: (seller: Seller) => seller?.name || "-",
    },
    {
      title: "Plan",
      dataIndex: "plan",
      key: "plan",
      render: (plan: Plan) => plan?.name || "-",
    },
    {
      title: "Products",
      dataIndex: "product_ids",
      key: "product_ids",
      width: 100,
      render: (ids: number[]) => ids?.length || 0,
    },
    {
      title: "Days",
      dataIndex: "days",
      key: "days",
      width: 80,
    },
    {
      title: "Total Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      width: 120,
      render: (amount?: number) =>
        amount ? `₦${Number(amount).toFixed(2)}` : "-",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status?: string) => getStatusBadge(status || ""),
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
      key: "start_date",
      width: 120,
      render: (date?: string) =>
        date ? moment(date).format("DD/MM/YYYY") : "-",
    },
    {
      title: "End Date",
      dataIndex: "end_date",
      key: "end_date",
      width: 120,
      render: (date?: string) =>
        date ? moment(date).format("DD/MM/YYYY") : "-",
    },
    {
      title: "Action",
      dataIndex: "id",
      key: "id",
      width: 150,
      fixed: "right" as const,
      render: (id: number, record: BoostRequest) =>
        renderDesktopActions(id, record),
    },
  ];

  const renderMobileCards = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return (
        <div className="dashboard-mobile-card__empty">
          <FiZap size={48} />
          <p>No boost requests yet</p>
        </div>
      );
    }

    return data.map((record: BoostRequest) => {
      const id = record?.id ?? record?._id;
      const productsCount = Array.isArray(record?.product_ids)
        ? record.product_ids.length
        : 0;
      const startDate = record?.start_date
        ? moment(record.start_date).format("DD MMM YYYY")
        : "-";
      const endDate = record?.end_date
        ? moment(record.end_date).format("DD MMM YYYY")
        : "-";
      const totalAmount =
        typeof record?.total_amount === "number"
          ? `₦${Number(record.total_amount).toFixed(2)}`
          : "--";

      return (
        <div className="dashboard-mobile-card" key={id}>
          <div className="dashboard-mobile-card__header">
            <div className="dashboard-mobile-card__avatar dashboard-mobile-card__avatar--icon" style={{ backgroundColor: '#fff7e6' }}>
              <FiZap size={24} color="#fa8c16" />
            </div>
            <div className="dashboard-mobile-card__info">
              <h4 className="dashboard-mobile-card__title">Request #{id ?? "--"}</h4>
              <span className="dashboard-mobile-card__subtitle">
                <FiUser size={12} /> {record?.seller?.name ?? "Unknown seller"}
              </span>
            </div>
            {getStatusBadge(record?.status || "")}
          </div>
          <div className="dashboard-mobile-card__body">
            <div className="dashboard-mobile-card__row">
              <span className="dashboard-mobile-card__label">
                <FiZap size={14} /> Plan
              </span>
              <span className="dashboard-mobile-card__value">{record?.plan?.name ?? "-"}</span>
            </div>
            <div className="dashboard-mobile-card__row">
              <span className="dashboard-mobile-card__label">
                <FiPackage size={14} /> Products
              </span>
              <span className="dashboard-mobile-card__value">{productsCount}</span>
            </div>
            <div className="dashboard-mobile-card__row">
              <span className="dashboard-mobile-card__label">
                <FiClock size={14} /> Days
              </span>
              <span className="dashboard-mobile-card__value">{record?.days ?? "-"}</span>
            </div>
            <div className="dashboard-mobile-card__row">
              <span className="dashboard-mobile-card__label">
                <FiDollarSign size={14} /> Amount
              </span>
              <span className="dashboard-mobile-card__value dashboard-mobile-card__value--highlight">{totalAmount}</span>
            </div>
            <div className="dashboard-mobile-card__row">
              <span className="dashboard-mobile-card__label">
                <FiCalendar size={14} /> Period
              </span>
              <span className="dashboard-mobile-card__value">{startDate} - {endDate}</span>
            </div>
          </div>
          <div className="dashboard-mobile-card__actions">
            <Button
              type="primary"
              ghost
              icon={<FiEye size={14} />}
              size="small"
              onClick={() => router.push(`/auth/boost-request/${id}`)}
            >
              View
            </Button>
            {record?.status === "pending" && (
              <Button
                icon={<FiEdit2 size={14} />}
                size="small"
                onClick={() => router.push(`/auth/boost-request/${id}/edit`)}
              >
                Edit
              </Button>
            )}
            <Popconfirm
              title="Delete Boost Request"
              description="Are you sure you want to delete this boost request?"
              onConfirm={() => mutationDelete.mutate(id as number)}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
              placement="topRight"
            >
              <Button
                danger
                size="small"
                icon={<FiTrash2 size={14} />}
                loading={
                  mutationDelete.isPending && mutationDelete.variables === id
                }
              >
                Delete
              </Button>
            </Popconfirm>
          </div>
        </div>
      );
    });
  }, [data, mutationDelete, router]);

  return (
    <div className="dashboard-table-container">
      {contextHolder}
      {!isMobile ? (
        <Table
          dataSource={data}
          columns={columns}
          pagination={false}
          size="small"
          scroll={{ x: 1200 }}
          rowKey={(record: BoostRequest) =>
            (record?.id ?? record?._id) as number
          }
          locale={{
            emptyText: (
              <div className="dashboard-mobile-card__empty">
                <FiZap size={48} />
                <p>No boost requests yet</p>
              </div>
            ),
          }}
        />
      ) : (
        <div className="dashboard-mobile-cards">{renderMobileCards}</div>
      )}
      <div className="table__pagination-container">
        <Pagination
          showSizeChanger
          pageSize={pageSize}
          current={page}
          total={count ?? 0}
          showTotal={(total: number) => `Total ${total ?? 0} Boost Requests`}
          onChange={(page, pageSize) => {
            setPage(page);
            setTake(pageSize);
          }}
        />
      </div>
    </div>
  );
}

export default DataTable;
