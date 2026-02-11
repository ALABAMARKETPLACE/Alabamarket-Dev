"use client";
import React, { useState, useEffect, useMemo } from "react";
import API from "@/config/API_ADMIN";
import {
  Button,
  Table,
  Popconfirm,
  Pagination,
  notification,
  Tooltip,
} from "antd";
import { FiTrash2, FiMail, FiMessageSquare, FiCalendar } from "react-icons/fi";
import moment from "moment";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DELETE } from "@/util/apicall";
interface props {
  data: any[];
  count: number;
  setPage: Function;
  setTake: Function;
  pageSize: number;
  page: number;
}
function DataTable({ data, count, setPage, setTake, pageSize, page }: props) {
  const [isMobile, setIsMobile] = useState(false);
  const [Notifications, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const mutationDelete = useMutation({
    mutationFn: (id: number) => {
      return DELETE(API.ENQUIRY_DELETE + id);
    },
    onError: (error, variables, context) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      Notifications["success"]({
        message: `Enquiry Deleted Successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin_enquiry"] });
    },
  });

  const columns = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email: string) => (
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <FiMail size={14} color="#1890ff" />
          {email}
        </span>
      ),
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      render: (message: string) => (
        <span className="table-desctext" style={{ maxWidth: "400px" }}>
          {message?.length > 80 ? `${message.substring(0, 80)}...` : message}
        </span>
      ),
    },
    {
      title: "Enquired on",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (item: any) => <span>{moment(item).format("MMM Do YYYY")}</span>,
    },
    {
      title: "Action",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (id: number, record: any) => (
        <div className="table-action">
          <Popconfirm
            title="Delete enquiry"
            description="Are you sure to delete this Enquiry?"
            okText="Yes"
            cancelText="No"
            placement="bottomLeft"
            onConfirm={() => mutationDelete.mutate(id)}
            okButtonProps={{ loading: mutationDelete.isPending }}
          >
            <Tooltip title="Delete enquiry">
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
          <FiMessageSquare size={48} />
          <p>No enquiries yet</p>
        </div>
      );
    }

    return data.map((record: any) => (
      <div className="dashboard-mobile-card" key={record?.id}>
        <div className="dashboard-mobile-card__header">
          <div className="dashboard-mobile-card__avatar dashboard-mobile-card__avatar--icon">
            <FiMail size={24} color="#1890ff" />
          </div>
          <div className="dashboard-mobile-card__info">
            <h4 className="dashboard-mobile-card__title">{record?.email}</h4>
            <span className="dashboard-mobile-card__subtitle">
              <FiCalendar size={12} />{" "}
              {moment(record?.createdAt).format("MMM Do YYYY")}
            </span>
          </div>
        </div>
        <div className="dashboard-mobile-card__body">
          <div
            className="dashboard-mobile-card__row"
            style={{
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "4px",
            }}
          >
            <span className="dashboard-mobile-card__label">
              <FiMessageSquare size={14} /> Message
            </span>
            <span
              className="dashboard-mobile-card__value"
              style={{ fontSize: "13px", color: "#555", lineHeight: "1.5" }}
            >
              {record?.message?.length > 150
                ? `${record?.message.substring(0, 150)}...`
                : record?.message}
            </span>
          </div>
        </div>
        <div className="dashboard-mobile-card__actions">
          <Popconfirm
            title="Delete enquiry"
            description="Are you sure to delete this Enquiry?"
            okText="Yes"
            cancelText="No"
            placement="topRight"
            onConfirm={() => mutationDelete.mutate(record?.id)}
            okButtonProps={{ loading: mutationDelete.isPending }}
          >
            <Button danger size="small" icon={<FiTrash2 size={14} />}>
              Delete
            </Button>
          </Popconfirm>
        </div>
      </div>
    ));
  }, [data, mutationDelete]);

  return (
    <div className="dashboard-table-container">
      {contextHolder}
      {!isMobile ? (
        <Table
          dataSource={data}
          columns={columns}
          pagination={false}
          size="small"
          rowKey={(record) => record?.id}
          locale={{
            emptyText: (
              <div className="dashboard-mobile-card__empty">
                <FiMessageSquare size={48} />
                <p>No enquiries yet</p>
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
          showTotal={(total: any) => `Total ${count ?? 0} Enquiry`}
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
