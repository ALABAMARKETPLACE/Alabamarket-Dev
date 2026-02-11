"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Table, Pagination } from "antd";
import moment from "moment";
import { useAppSelector } from "@/redux/hooks";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import { FiDollarSign, FiCalendar, FiCreditCard, FiCheckCircle } from "react-icons/fi";
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
  const Settings = useAppSelector(reduxSettings);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getCurrencySymbol = () => Settings.currency === "NGN" ? "₦" : Settings.currency;

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'completed' || statusLower === 'success' || statusLower === 'paid') {
      return <span className="dashboard-badge dashboard-badge--success">{status}</span>;
    }
    if (statusLower === 'pending') {
      return <span className="dashboard-badge dashboard-badge--warning">{status}</span>;
    }
    if (statusLower === 'failed') {
      return <span className="dashboard-badge dashboard-badge--danger">{status}</span>;
    }
    return <span className="dashboard-badge dashboard-badge--default">{status}</span>;
  };

  const columns = [
    {
      title: "Amount",
      dataIndex: "paid",
      key: "paid",
      render: (item: any) => (
        <span className="fw-medium" style={{ color: '#1890ff' }}>
          {getCurrencySymbol()} {formatCurrency(Number(item))}
        </span>
      ),
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      render: (item: any) => (
        <span>
          {getCurrencySymbol()} {formatCurrency(Number(item))}
        </span>
      ),
    },
    {
      title: "Total Settled",
      dataIndex: "total",
      key: "total",
      render: (item: any) => (
        <span style={{ color: '#52c41a', fontWeight: 500 }}>
          {getCurrencySymbol()} {formatCurrency(Number(item))}
        </span>
      ),
    },
    {
      title: "Payment Type",
      dataIndex: "payment_type",
      key: "payment_type",
      render: (item: any) => (
        <span className="dashboard-badge dashboard-badge--info">{item || '-'}</span>
      ),
    },
    {
      title: "Payment Status",
      dataIndex: "status",
      key: "status",
      render: (item: any) => getStatusBadge(item),
    },
    {
      title: "Settlement Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (item: any) => <span>{moment(item).format("MMM Do YYYY")}</span>,
    },
  ];

  const MobileCardView = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return (
        <div className="dashboard-mobile-card__empty">
          <FiDollarSign size={48} />
          <p>No settlements yet</p>
        </div>
      );
    }

    return data.map((record: any, index: number) => (
      <div className="dashboard-mobile-card" key={record?.id || index}>
        <div className="dashboard-mobile-card__header">
          <div className="dashboard-mobile-card__avatar dashboard-mobile-card__avatar--icon" style={{ backgroundColor: '#e6f7ff' }}>
            <FiDollarSign size={24} color="#1890ff" />
          </div>
          <div className="dashboard-mobile-card__info">
            <h4 className="dashboard-mobile-card__title" style={{ color: '#1890ff' }}>
              {getCurrencySymbol()} {formatCurrency(Number(record?.paid))}
            </h4>
            <span className="dashboard-mobile-card__subtitle">
              <FiCalendar size={12} /> {moment(record?.createdAt).format("MMM Do YYYY")}
            </span>
          </div>
          {getStatusBadge(record?.status)}
        </div>
        <div className="dashboard-mobile-card__body">
          <div className="dashboard-mobile-card__row">
            <span className="dashboard-mobile-card__label">Balance</span>
            <span className="dashboard-mobile-card__value">
              {getCurrencySymbol()} {formatCurrency(Number(record?.balance))}
            </span>
          </div>
          <div className="dashboard-mobile-card__row">
            <span className="dashboard-mobile-card__label">
              <FiCheckCircle size={14} /> Total Settled
            </span>
            <span className="dashboard-mobile-card__value dashboard-mobile-card__value--highlight" style={{ color: '#52c41a' }}>
              {getCurrencySymbol()} {formatCurrency(Number(record?.total))}
            </span>
          </div>
          <div className="dashboard-mobile-card__row">
            <span className="dashboard-mobile-card__label">
              <FiCreditCard size={14} /> Payment Type
            </span>
            <span className="dashboard-mobile-card__value">
              <span className="dashboard-badge dashboard-badge--info">{record?.payment_type || '-'}</span>
            </span>
          </div>
        </div>
      </div>
    ));
  }, [data, Settings?.currency]);

  return (
    <div className="dashboard-table-container">
      {!isMobile ? (
        <Table
          dataSource={data}
          columns={columns}
          pagination={false}
          size="small"
          rowKey={(record, index) => record?.id || index}
          locale={{
            emptyText: (
              <div className="dashboard-mobile-card__empty">
                <FiDollarSign size={48} />
                <p>No settlements yet</p>
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
          current={page}
          total={count ?? 0}
          showTotal={(total: any) => `Total ${count ?? 0} Entry`}
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
