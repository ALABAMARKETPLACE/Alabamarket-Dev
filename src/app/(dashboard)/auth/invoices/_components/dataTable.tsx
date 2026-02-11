"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Button, Table, Popconfirm, Pagination, Tooltip } from "antd";
import {
  FiTrash2,
  FiFileText,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiHash,
} from "react-icons/fi";
import moment from "moment";
import { useAppSelector } from "@/redux/hooks";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import { formatCurrency } from "@/utils/formatNumber";

interface props {
  data: any[];
  count: number;
  setPage: Function;
  setTake: Function;
  pageSize: number;
  page: number;
}
function DataTable({ data, count, setPage, setTake, pageSize, page }: props) {
  const settings = useAppSelector(reduxSettings);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getCurrencySymbol = () =>
    settings.currency === "NGN" ? "₦" : settings.currency;

  const columns = [
    {
      title: "Invoice ID",
      dataIndex: "invoice_id",
      key: "invoice_id",
      render: (id: string) => (
        <span style={{ fontWeight: 500, color: "#1890ff" }}>
          <FiHash size={12} /> {id}
        </span>
      ),
    },
    {
      title: "Customer Name",
      dataIndex: "to_name",
      key: "to_name",
      render: (name: string) => (
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <FiUser size={14} color="#666" />
          {name}
        </span>
      ),
    },
    {
      title: "Total",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (text: any) => (
        <span style={{ fontWeight: 600, color: "#52c41a" }}>
          {getCurrencySymbol()} {formatCurrency(Number(text))}
        </span>
      ),
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      render: (text: any, record: any) => {
        const isOverdue = moment(text).isBefore(moment());
        return (
          <span
            className={`dashboard-badge dashboard-badge--${isOverdue ? "danger" : "default"}`}
          >
            {moment(text).format("DD/MM/YYYY")}
          </span>
        );
      },
    },
    {
      title: "Action",
      width: 80,
      render: (item: any, record: any) => (
        <div className="table-action">
          <Popconfirm
            title="Delete invoice"
            description="Are you sure to delete this Invoice?"
            okText="Yes"
            cancelText="No"
            placement="bottomLeft"
          >
            <Tooltip title="Delete invoice">
              <Button
                type="text"
                size="small"
                icon={<FiTrash2 size={16} color="#ff4d4f" />}
              />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const MobileCardView = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return (
        <div className="dashboard-mobile-card__empty">
          <FiFileText size={48} />
          <p>No invoices yet</p>
        </div>
      );
    }

    return data.map((record: any) => {
      const isOverdue = moment(record?.due_date).isBefore(moment());
      return (
        <div
          className="dashboard-mobile-card"
          key={record?.invoice_id || record?.id}
        >
          <div className="dashboard-mobile-card__header">
            <div
              className="dashboard-mobile-card__avatar dashboard-mobile-card__avatar--icon"
              style={{ backgroundColor: "#e6f7ff" }}
            >
              <FiFileText size={24} color="#1890ff" />
            </div>
            <div className="dashboard-mobile-card__info">
              <h4
                className="dashboard-mobile-card__title"
                style={{ color: "#1890ff" }}
              >
                #{record?.invoice_id}
              </h4>
              <span className="dashboard-mobile-card__subtitle">
                <FiUser size={12} /> {record?.to_name}
              </span>
            </div>
            <span
              style={{ fontWeight: 600, color: "#52c41a", fontSize: "16px" }}
            >
              {getCurrencySymbol()}{" "}
              {formatCurrency(Number(record?.total_amount))}
            </span>
          </div>
          <div className="dashboard-mobile-card__body">
            <div className="dashboard-mobile-card__row">
              <span className="dashboard-mobile-card__label">
                <FiCalendar size={14} /> Due Date
              </span>
              <span className="dashboard-mobile-card__value">
                <span
                  className={`dashboard-badge dashboard-badge--${isOverdue ? "danger" : "default"}`}
                >
                  {moment(record?.due_date).format("DD/MM/YYYY")}
                </span>
              </span>
            </div>
          </div>
          <div className="dashboard-mobile-card__actions">
            <Popconfirm
              title="Delete invoice"
              description="Are you sure to delete this Invoice?"
              okText="Yes"
              cancelText="No"
              placement="topRight"
            >
              <Button danger size="small" icon={<FiTrash2 size={14} />}>
                Delete
              </Button>
            </Popconfirm>
          </div>
        </div>
      );
    });
  }, [data, settings?.currency]);

  return (
    <div className="dashboard-table-container">
      {!isMobile ? (
        <Table
          dataSource={data}
          columns={columns}
          pagination={false}
          size="small"
          rowKey={(record) => record?.invoice_id || record?.id}
          locale={{
            emptyText: (
              <div className="dashboard-mobile-card__empty">
                <FiFileText size={48} />
                <p>No invoices yet</p>
              </div>
            ),
          }}
        />
      ) : (
        <div className="dashboard-mobile-cards">{MobileCardView}</div>
      )}
      <div className="table__pagination-container">
        <Pagination
          showSizeChanger
          pageSize={pageSize}
          showTotal={(total: any) => `Total ${count ?? 0} Invoice`}
          onChange={(page, pageSize) => {
            setPage(page);
            setTake(pageSize);
          }}
          total={count ?? 0}
          current={page}
        />
      </div>
    </div>
  );
}

export default DataTable;
