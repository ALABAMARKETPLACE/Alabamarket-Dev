"use client";
import React, { useEffect, useState } from "react";
import { Button, Table, Tag, Pagination, Avatar, Tooltip } from "antd";
import { MdHourglassEmpty } from "react-icons/md";
import moment from "moment";
import { FiEye, FiMail, FiPhone, FiCheckCircle, FiUser } from "react-icons/fi";
import { IoMdCheckmarkCircle } from "react-icons/io";
import { useRouter } from "next/navigation";

interface DataTableProps {
  data: any[];
  count: number;
  setPage: (p: number, t: number) => void;
  pageSize: number;
  page: number;
}

function DataTable({ data, count, setPage, pageSize, page }: DataTableProps) {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const columns = [
    {
      title: "User",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: any) => (
        <div className="table__user-cell">
          <Avatar
            size={40}
            src={record.image || undefined}
            icon={!record.image && <FiUser />}
            style={{
              backgroundColor: !record.image ? "#f0f0f0" : undefined,
              color: !record.image ? "#999" : undefined,
            }}
          />
          <div>
            <div className="table__user-name">{name || "N/A"}</div>
            <div className="table__text--secondary" style={{ fontSize: 12 }}>
              {record.email || "No email"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (phone: string, record: any) => (
        <div className="table__text--secondary">
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <FiPhone size={14} />
            {record.countrycode || ""} {phone || "N/A"}
            {record.phone_verify && (
              <Tooltip title="Phone Verified">
                <IoMdCheckmarkCircle color="#10b981" size={16} />
              </Tooltip>
            )}
          </span>
        </div>
      ),
      responsive: ["md"] as any,
    },
    {
      title: "Email Status",
      dataIndex: "mail_verify",
      key: "mail_verify",
      render: (verified: boolean) => (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <FiMail size={14} color={verified ? "#10b981" : "#999"} />
          <span
            className={
              verified
                ? "dashboard-badge dashboard-badge--success"
                : "dashboard-badge dashboard-badge--default"
            }
          >
            {verified ? "Verified" : "Unverified"}
          </span>
        </div>
      ),
      responsive: ["lg"] as any,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: boolean) => (
        <span
          className={
            status
              ? "dashboard-badge dashboard-badge--success"
              : "dashboard-badge dashboard-badge--danger"
          }
        >
          <span className="dashboard-badge__dot" />
          {status ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      title: "Joined",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => (
        <div className="table__date">{moment(date).format("MMM DD, YYYY")}</div>
      ),
      responsive: ["md"] as any,
    },
    {
      title: "Action",
      dataIndex: "_id",
      key: "_id",
      width: 80,
      render: (id: string) => (
        <Tooltip title="View Details">
          <Button
            type="text"
            size="small"
            className="table__action-btn"
            onClick={() => router.push(`/auth/users/${id}`)}
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
            <p style={{ color: "#666", marginTop: 16 }}>No Users yet</p>
          </div>
        </div>
      ) : (
        data.map((user: any, index: number) => (
          <div key={user._id || index} className="dashboard-mobile-card">
            <div className="dashboard-mobile-card__header">
              <div className="dashboard-mobile-card__avatar">
                <Avatar
                  size={48}
                  src={user.image || undefined}
                  icon={!user.image && <FiUser />}
                  style={{
                    backgroundColor: !user.image ? "#f0f0f0" : undefined,
                    width: "100%",
                    height: "100%",
                  }}
                />
              </div>
              <div className="dashboard-mobile-card__title-group">
                <h4 className="dashboard-mobile-card__title">
                  {user.name || "N/A"}
                </h4>
                <p className="dashboard-mobile-card__subtitle">
                  {user.email || "No email"}
                </p>
              </div>
              <span
                className={
                  user.status
                    ? "dashboard-badge dashboard-badge--success"
                    : "dashboard-badge dashboard-badge--danger"
                }
              >
                {user.status ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="dashboard-mobile-card__body">
              <div className="dashboard-mobile-card__row">
                <span className="dashboard-mobile-card__label">Phone</span>
                <span className="dashboard-mobile-card__value">
                  {user.countrycode || ""} {user.phone || "N/A"}
                  {user.phone_verify && (
                    <IoMdCheckmarkCircle
                      color="#10b981"
                      size={14}
                      style={{ marginLeft: 4 }}
                    />
                  )}
                </span>
              </div>
              <div className="dashboard-mobile-card__row">
                <span className="dashboard-mobile-card__label">
                  Email Status
                </span>
                <span
                  className={
                    user.mail_verify
                      ? "dashboard-badge dashboard-badge--success"
                      : "dashboard-badge dashboard-badge--default"
                  }
                >
                  {user.mail_verify ? "Verified" : "Unverified"}
                </span>
              </div>
              <div className="dashboard-mobile-card__row">
                <span className="dashboard-mobile-card__label">Joined</span>
                <span className="dashboard-mobile-card__value">
                  {moment(user.createdAt).format("MMM DD, YYYY")}
                </span>
              </div>
            </div>
            <div className="dashboard-mobile-card__footer">
              <Button
                type="primary"
                ghost
                block
                icon={<FiEye />}
                onClick={() => router.push(`/auth/users/${user._id}`)}
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
          rowKey={(record) => record._id || record.id}
          locale={{
            emptyText: (
              <div className="table__empty-state">
                <MdHourglassEmpty size={48} className="table__empty-icon" />
                <p className="table__empty-text">No Users yet</p>
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
          showTotal={(total) => `Total ${count ?? 0} Users`}
          onChange={(page, pageSize) => setPage(page, pageSize)}
          className="table__pagination"
        />
      </div>
    </div>
  );
}

export default DataTable;
