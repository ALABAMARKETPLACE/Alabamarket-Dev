"use client";
import React, { useState, useEffect, useMemo } from "react";
import API from "@/config/API_ADMIN";
import {
  Button,
  Table,
  Image,
  Popconfirm,
  Pagination,
  notification,
  Tooltip,
} from "antd";
import { FiEdit2, FiTrash2, FiTag, FiCalendar, FiGift } from "react-icons/fi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DELETE } from "@/util/apicall";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
interface props {
  data: any[];
  count: number;
  setPage: Function;
  setTake: Function;
  pageSize: number;
  page: number;
  edit: Function;
}
function DataTable({
  data,
  count,
  setPage,
  setTake,
  pageSize,
  page,
  edit,
}: props) {
  const { data: session }: any = useSession();
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
      return DELETE(API.OFFERS + id);
    },
    onError: (error, variables, context) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      Notifications["success"]({
        message: `Offer Deleted Successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin_offers"] });
    },
  });

  const columns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      width: 50,
      render: (item: string) => (
        <div className="table-img">
          <Image
            style={{ height: 35, width: 35, objectFit: "contain" }}
            src={item}
          />
        </div>
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: 400,
    },
    {
      title: "Tag",
      dataIndex: "tag",
      key: "tag",
      render: (item: string) => (
        <span className="dashboard-badge dashboard-badge--info">
          {item || "-"}
        </span>
      ),
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
      key: "start_date",
      render: (text: any, record: any) => {
        return <div>{dayjs(text).format("MMM Do YYYY")}</div>;
      },
    },
    {
      title: "End Date",
      dataIndex: "end_date",
      key: "end_date",
      render: (text: any, record: any) => {
        return <div>{dayjs(text).format("MMM Do YYYY")}</div>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (item: boolean) => (
        <span
          className={`dashboard-badge dashboard-badge--${item ? "success" : "default"}`}
        >
          {item ? "Active" : "Inactive"}
        </span>
      ),
    },
    ...(session?.role == "admin"
      ? [
          {
            title: "Action",
            width: 100,
            render: (item: any, record: any) => (
              <div className="table-action">
                <Tooltip title="Edit offer">
                  <Button
                    type="text"
                    size="small"
                    onClick={() => edit(record)}
                    icon={<FiEdit2 size={16} color="#1890ff" />}
                  />
                </Tooltip>
                <Popconfirm
                  title="Delete offer"
                  description="Are you sure to delete this Offer?"
                  okText="Yes"
                  cancelText="No"
                  placement="bottomLeft"
                  onConfirm={() => mutationDelete.mutate(record?.id)}
                  okButtonProps={{ loading: mutationDelete.isPending }}
                >
                  <Tooltip title="Delete offer">
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
        ]
      : []),
  ];

  const MobileCardView = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return (
        <div className="dashboard-mobile-card__empty">
          <FiGift size={48} />
          <p>No offers yet</p>
        </div>
      );
    }

    return data.map((record: any) => (
      <div className="dashboard-mobile-card" key={record?.id}>
        <div className="dashboard-mobile-card__header">
          <div className="dashboard-mobile-card__avatar">
            <Image
              src={record?.image}
              alt={record?.title}
              height={56}
              width={56}
              style={{ borderRadius: "8px", objectFit: "contain" }}
            />
          </div>
          <div className="dashboard-mobile-card__info">
            <h4 className="dashboard-mobile-card__title">{record?.title}</h4>
            {record?.tag && (
              <span
                className="dashboard-badge dashboard-badge--info"
                style={{ marginTop: "4px" }}
              >
                <FiTag size={10} /> {record?.tag}
              </span>
            )}
          </div>
          <span
            className={`dashboard-badge dashboard-badge--${record?.status ? "success" : "default"}`}
          >
            {record?.status ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="dashboard-mobile-card__body">
          <div className="dashboard-mobile-card__row">
            <span className="dashboard-mobile-card__label">
              <FiCalendar size={14} /> Start Date
            </span>
            <span className="dashboard-mobile-card__value">
              {dayjs(record?.start_date).format("MMM Do YYYY")}
            </span>
          </div>
          <div className="dashboard-mobile-card__row">
            <span className="dashboard-mobile-card__label">
              <FiCalendar size={14} /> End Date
            </span>
            <span className="dashboard-mobile-card__value">
              {dayjs(record?.end_date).format("MMM Do YYYY")}
            </span>
          </div>
        </div>
        {session?.role === "admin" && (
          <div className="dashboard-mobile-card__actions">
            <Button
              type="primary"
              ghost
              icon={<FiEdit2 size={14} />}
              size="small"
              onClick={() => edit(record)}
            >
              Edit
            </Button>
            <Popconfirm
              title="Delete offer"
              description="Are you sure to delete this Offer?"
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
        )}
      </div>
    ));
  }, [data, edit, mutationDelete, session?.role]);

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
                <FiGift size={48} />
                <p>No offers yet</p>
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
          showTotal={(total: any) => `Total ${count ?? 0} Offers`}
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
