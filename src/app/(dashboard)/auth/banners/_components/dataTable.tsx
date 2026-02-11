"use client";
import React, { useEffect, useMemo, useReducer, useState } from "react";
import {
  Button,
  Table,
  Image,
  Popconfirm,
  Popover,
  Form,
  Input,
  Space,
  Pagination,
  Badge,
  notification,
  Tooltip,
} from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiImage,
  FiMonitor,
  FiSmartphone,
  FiCalendar,
  FiCheckCircle,
} from "react-icons/fi";
import { CgReorder } from "react-icons/cg";
import moment from "moment";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DELETE, PUT } from "@/util/apicall";
import { reducer } from "./reducer";
import API from "@/config/API_ADMIN";
import "../styles.scss";
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
  const [isMobile, setIsMobile] = useState(false);
  const [deletePopconfim, dispatch] = useReducer(reducer, {
    open: false,
    id: -1,
  });
  const [Notifications, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();
  const mutationDelete = useMutation({
    mutationFn: (id: number) => {
      return DELETE(API.BANNER_DELETE + id);
    },
    onError: (error) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: () => {
      Notifications["success"]({
        message: `Banner Deleted Successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin_banners"] });
    },
  });
  const mutationPositionUpdate = useMutation({
    mutationFn: (values: any) => {
      const obj = {
        position: Number(values?.position),
      };
      return PUT(API.BANNER_POSITION_UPDATE + values?.id, obj);
    },
    onError: (error) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: () => {
      dispatch({ type: "close" });
      Notifications["success"]({
        message: `Banner Position Successfully Updated`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin_banners"] });
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

  const renderActions = (record: any) => (
    <div className="table-action">
      <Tooltip title="Edit banner">
        <Button
          type="text"
          size="small"
          onClick={() => edit(record)}
          icon={<FiEdit2 size={16} color="#1890ff" />}
        />
      </Tooltip>

      <Popconfirm
        title="Delete banner"
        description="Are you sure to delete this Banner?"
        okText="Yes"
        cancelText="No"
        placement="bottomLeft"
        onCancel={() => dispatch({ type: "close" })}
        open={deletePopconfim?.open && record?.id === deletePopconfim?.id}
        onConfirm={() => mutationDelete.mutate(record?.id)}
        okButtonProps={{ loading: mutationDelete.isPending }}
      >
        <Tooltip title="Delete banner">
          <Button
            type="text"
            size="small"
            onClick={() => dispatch({ type: "open", id: record?.id })}
            icon={<FiTrash2 size={16} color="#ff4d4f" />}
          />
        </Tooltip>
      </Popconfirm>

      <Popover
        title="Change Order"
        placement="bottomLeft"
        trigger="click"
        content={
          <div>
            <Form
              initialValues={{ position: record?.position ?? 0 }}
              onFinish={(val: any) =>
                mutationPositionUpdate.mutate({
                  position: val?.position,
                  id: record?.id,
                })
              }
            >
              <Space.Compact>
                <Form.Item style={{ marginBottom: 5 }} name={"position"}>
                  <Input style={{ width: 110 }} type="number" />
                </Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={mutationPositionUpdate.isPending}
                >
                  Done
                </Button>
              </Space.Compact>
            </Form>
          </div>
        }
      >
        <Tooltip title="Change position">
          <Button type="text" size="small">
            <Badge size="small" count={record?.position}>
              <CgReorder size={20} />
            </Badge>
          </Button>
        </Tooltip>
      </Popover>
    </div>
  );

  const columns = [
    {
      title: "Image",
      dataIndex: "img_desk",
      key: "img_desk",
      width: 50,
      render: (item: string) => (
        <div className="table-img">
          <Image
            style={{ height: 35, width: 35, objectFit: "cover" }}
            src={item}
          />
        </div>
      ),
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: 500,
    },
    {
      title: "Desktop Size",
      dataIndex: "age",
      key: "age",
      width: 100,
      render: (text: any, record: any) => {
        return record?.img_desk ? (
          <span className="dashboard-badge dashboard-badge--success">
            Available
          </span>
        ) : (
          <span className="dashboard-badge dashboard-badge--danger">
            Not Available
          </span>
        );
      },
    },
    {
      title: "Mobile Size",
      dataIndex: "age",
      key: "age",
      width: 100,
      render: (text: any, record: any) => {
        return record?.img_mob ? (
          <span className="dashboard-badge dashboard-badge--success">
            Available
          </span>
        ) : (
          <span className="dashboard-badge dashboard-badge--danger">
            Not Available
          </span>
        );
      },
    },

    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (item: string) => <span>{`${moment(item).format("lll")}`}</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 80,
      render: (item: boolean) => (
        <span>
          {item === true ? (
            <span className="dashboard-badge dashboard-badge--success">
              Active
            </span>
          ) : (
            <span className="dashboard-badge dashboard-badge--default">
              Inactive
            </span>
          )}
        </span>
      ),
    },
    {
      title: "Action",
      width: 100,
      render: (item: any, record: any) => renderActions(record),
    },
  ];

  const renderMobileContent = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return (
        <div className="dashboard-mobile-card__empty">
          <FiImage size={48} />
          <p>No banners yet</p>
        </div>
      );
    }

    return data.map((record: any) => {
      const id = record?.id ?? record?._id;
      return (
        <div className="dashboard-mobile-card" key={id}>
          <div className="dashboard-mobile-card__header">
            <div
              className="dashboard-mobile-card__avatar"
              style={{ borderRadius: "8px", overflow: "hidden" }}
            >
              <Image
                src={record?.img_desk || record?.img_mob}
                alt={record?.title}
                width={70}
                height={50}
                style={{ objectFit: "cover" }}
              />
            </div>
            <div className="dashboard-mobile-card__info">
              <h4 className="dashboard-mobile-card__title">
                {record?.title ?? "Untitled Banner"}
              </h4>
              <span className="dashboard-mobile-card__subtitle">
                <FiCalendar size={12} />
                {record?.createdAt
                  ? moment(record?.createdAt).format("MMM Do YYYY")
                  : "--"}
              </span>
            </div>
            {record?.status ? (
              <span className="dashboard-badge dashboard-badge--success">
                Active
              </span>
            ) : (
              <span className="dashboard-badge dashboard-badge--default">
                Inactive
              </span>
            )}
          </div>
          <div className="dashboard-mobile-card__body">
            <div className="dashboard-mobile-card__row">
              <span className="dashboard-mobile-card__label">
                <FiMonitor size={14} /> Desktop
              </span>
              <span className="dashboard-mobile-card__value">
                {record?.img_desk ? (
                  <span className="dashboard-badge dashboard-badge--success">
                    Available
                  </span>
                ) : (
                  <span className="dashboard-badge dashboard-badge--danger">
                    Not Available
                  </span>
                )}
              </span>
            </div>
            <div className="dashboard-mobile-card__row">
              <span className="dashboard-mobile-card__label">
                <FiSmartphone size={14} /> Mobile
              </span>
              <span className="dashboard-mobile-card__value">
                {record?.img_mob ? (
                  <span className="dashboard-badge dashboard-badge--success">
                    Available
                  </span>
                ) : (
                  <span className="dashboard-badge dashboard-badge--danger">
                    Not Available
                  </span>
                )}
              </span>
            </div>
            <div className="dashboard-mobile-card__row">
              <span className="dashboard-mobile-card__label">Position</span>
              <span className="dashboard-mobile-card__value">
                #{record?.position ?? "-"}
              </span>
            </div>
          </div>
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
              title="Delete banner"
              description="Are you sure to delete this Banner?"
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
      );
    });
  }, [data, edit, mutationDelete]);

  return (
    <div className="dashboard-table-container">
      {contextHolder}
      {!isMobile ? (
        <Table
          dataSource={data}
          columns={columns}
          pagination={false}
          size="small"
          rowKey={(record: any) => record?.id ?? record?._id}
          locale={{
            emptyText: (
              <div className="dashboard-mobile-card__empty">
                <FiImage size={48} />
                <p>No banners yet</p>
              </div>
            ),
          }}
        />
      ) : (
        <div className="dashboard-mobile-cards">{renderMobileContent}</div>
      )}
      <div className="table__pagination-container">
        <Pagination
          showSizeChanger
          pageSize={pageSize}
          showTotal={(total: any) => `Total ${count ?? 0} Banners`}
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
