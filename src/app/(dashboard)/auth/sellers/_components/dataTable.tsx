"use client";
import React, { useEffect, useState } from "react";
import { Button, Table, Pagination, Avatar, Tooltip } from "antd";
import { useAppSelector } from "@/redux/hooks";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import {
  FiEye,
  FiShoppingBag,
  FiPhone,
  FiDollarSign,
  FiUser,
} from "react-icons/fi";
import { MdHourglassEmpty } from "react-icons/md";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/utils/formatNumber";

interface DataTableProps {
  data: any[];
  count: number;
  setPage: (p: number, t: number) => void;
  pageSize: number;
  page: number;
}

function DataTable({ data, count, setPage, pageSize, page }: DataTableProps) {
  const settings = useAppSelector(reduxSettings);
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const currencySymbol =
    settings?.currency === "NGN" ? "₦" : settings?.currency;

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === "approved")
      return "dashboard-badge dashboard-badge--success";
    if (statusLower === "pending")
      return "dashboard-badge dashboard-badge--warning";
    return "dashboard-badge dashboard-badge--danger";
  };

  const columns = [
    {
      title: "Store",
      dataIndex: "store_name",
      key: "store_name",
      render: (storeName: string, record: any) => (
        <div className="table__user-cell">
          <Avatar
            size={44}
            src={record.logo_upload || undefined}
            icon={!record.logo_upload && <FiShoppingBag />}
            style={{
              backgroundColor: !record.logo_upload ? "#f0f0f0" : undefined,
              color: !record.logo_upload ? "#999" : undefined,
            }}
          />
          <div>
            <div className="table__user-name">{storeName || "N/A"}</div>
            <div className="table__text--secondary" style={{ fontSize: 12 }}>
              <FiUser size={12} style={{ marginRight: 4 }} />
              {record.name || "No owner"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Contact",
      dataIndex: "phone",
      key: "phone",
      render: (phone: string, record: any) => (
        <div className="table__text--secondary">
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <FiPhone size={14} />
            {record?.code || ""} {phone || "N/A"}
          </span>
        </div>
      ),
      responsive: ["md"] as any,
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      render: (balance: number) => (
        <div className="table__amount">
          <FiDollarSign size={14} style={{ marginRight: 4 }} />
          {currencySymbol} {formatCurrency(balance || 0)}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <span className={getStatusBadge(status)}>
          <span className="dashboard-badge__dot" />
          {status || "N/A"}
        </span>
      ),
    },
    {
      title: "Action",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (id: string) => (
        <Tooltip title="View Details">
          <Button
            type="text"
            size="small"
            className="table__action-btn"
            onClick={() => router.push(`/auth/sellers/${id}`)}
            icon={<FiEye size={18} />}
          />
        </Tooltip>
      ),
    },
  ];

  // Mobile Card View
  const MobileCardView = () => (
    <div className="dashboard-mobile-cards">
      {data.length === 0 ? (
        <div className="dashboard-mobile-card">
          <div style={{ padding: 40, textAlign: "center" }}>
            <MdHourglassEmpty size={40} color="#999" />
            <p style={{ color: "#666", marginTop: 16 }}>No Sellers yet</p>
          </div>
        </div>
      ) : (
        data.map((seller: any, index: number) => (
          <div key={seller.id || index} className="dashboard-mobile-card">
            <div className="dashboard-mobile-card__header">
              <div className="dashboard-mobile-card__avatar">
                <Avatar
                  size={48}
                  src={seller.logo_upload || undefined}
                  icon={!seller.logo_upload && <FiShoppingBag />}
                  style={{
                    backgroundColor: !seller.logo_upload
                      ? "#f0f0f0"
                      : undefined,
                    width: "100%",
                    height: "100%",
                  }}
                />
              </div>
              <div className="dashboard-mobile-card__title-group">
                <h4 className="dashboard-mobile-card__title">
                  {seller.store_name || "N/A"}
                </h4>
                <p className="dashboard-mobile-card__subtitle">
                  {seller.name || "No owner"}
                </p>
              </div>
              <span className={getStatusBadge(seller.status)}>
                {seller.status || "N/A"}
              </span>
            </div>
            <div className="dashboard-mobile-card__body">
              <div className="dashboard-mobile-card__row">
                <span className="dashboard-mobile-card__label">Phone</span>
                <span className="dashboard-mobile-card__value">
                  {seller.code || ""} {seller.phone || "N/A"}
                </span>
              </div>
              <div className="dashboard-mobile-card__row">
                <span className="dashboard-mobile-card__label">Balance</span>
                <span
                  className="dashboard-mobile-card__value"
                  style={{ fontWeight: 600, color: "#10b981" }}
                >
                  {currencySymbol} {formatCurrency(seller.balance || 0)}
                </span>
              </div>
            </div>
            <div className="dashboard-mobile-card__footer">
              <Button
                type="primary"
                ghost
                block
                icon={<FiEye />}
                onClick={() => router.push(`/auth/sellers/${seller.id}`)}
              >
                View Details
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="dashboard-table-container">
      {isMobile ? (
        <MobileCardView />
      ) : (
        <Table
          dataSource={data}
          columns={columns}
          pagination={false}
          size="middle"
          rowKey={(record) => record.id || record._id}
          locale={{
            emptyText: (
              <div className="table__empty-state">
                <MdHourglassEmpty size={48} className="table__empty-icon" />
                <p className="table__empty-text">No Sellers yet</p>
              </div>
            ),
          }}
        />
      )}
      <div className="table__pagination-container">
        <Pagination
          showSizeChanger
          pageSize={pageSize}
          current={page}
          total={count ?? 0}
          showTotal={(total) => `Total ${count ?? 0} Sellers`}
          onChange={(page, pageSize) => setPage(page, pageSize)}
          className="table__pagination"
        />
      </div>
    </div>
  );
}

export default DataTable;
