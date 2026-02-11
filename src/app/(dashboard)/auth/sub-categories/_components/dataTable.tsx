"use client";
import React, { useState, useEffect, useMemo } from "react";
import API from "@/config/API_ADMIN";
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
import { FiEdit2, FiTrash2, FiCalendar, FiLayers, FiFolder } from "react-icons/fi";
import { CgReorder } from "react-icons/cg";
import moment from "moment";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DELETE, PUT } from "../../../../../util/apicall";
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
      return DELETE(API.SUBCATEGORY + id);
    },
    onError: (error, variables, context) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      Notifications["success"]({
        message: `Subcategory Deleted Successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin_subcategory"] });
    },
  });

  const mutationUpdate = useMutation({
    mutationFn: (data: any) => {
      const obj = {
        position: Number(data?.position),
      };
      return PUT(API.SUB_CATEGORY_UPDATE_POSITION + data?.id, obj);
    },
    onError: (error, variables, context) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      Notifications["success"]({
        message: `Subcategory Position updated`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin_subcategory"] });
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
            style={{ height: 35, width: 35, objectFit: "cover" }}
            src={item}
          />
        </div>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      width: 300,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      width: 300,
      render: (text: boolean) => <div className="table-desctext">{text}</div>,
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 200,
      render: (item: any) => item.name,
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: any, record: any) => {
        return <div>{moment(text).format("MMM Do YYYY")}</div>;
      },
    },
    {
      title: "Action",
      width: 140,
      render: (item: any, record: any) => (
        <div className="table-action">
          <Tooltip title="Edit subcategory">
            <Button 
              type="text" 
              size="small" 
              onClick={() => edit(record)}
              icon={<FiEdit2 size={16} color="#1890ff" />}
            />
          </Tooltip>

          <Popconfirm
            title="Delete subcategory"
            description="Are you sure to delete this Subcategory?"
            okText="Yes"
            cancelText="No"
            placement="bottomLeft"
            onConfirm={() => mutationDelete.mutate(record?._id)}
          >
            <Tooltip title="Delete subcategory">
              <Button 
                type="text" 
                size="small"
                icon={<FiTrash2 size={16} color="#ff4d4f" />}
              />
            </Tooltip>
          </Popconfirm>

          <Popover
            title="Change Order"
            placement="bottomLeft"
            trigger="click"
            content={
              <Form
                initialValues={{ position: record?.position ?? 0 }}
                onFinish={(value) =>
                  mutationUpdate.mutate({
                    id: record?._id,
                    position: value?.position,
                  })
                }
              >
                <Space.Compact>
                  <Form.Item
                    style={{ marginBottom: 5 }}
                    name={"position"}
                    rules={[
                      {
                        required: true,
                        message: "Enter Position",
                      },
                    ]}
                  >
                    <Input style={{ width: 110 }} type="number" />
                  </Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={mutationUpdate.isPending}
                  >
                    Done
                  </Button>
                </Space.Compact>
              </Form>
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
      ),
    },
  ];

  const MobileCardView = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return (
        <div className="dashboard-mobile-card__empty">
          <FiLayers size={48} />
          <p>No subcategories yet</p>
        </div>
      );
    }

    return data.map((record: any) => (
      <div className="dashboard-mobile-card" key={record?._id}>
        <div className="dashboard-mobile-card__header">
          <div className="dashboard-mobile-card__avatar">
            <Image
              src={record?.image}
              alt={record?.name}
              height={56}
              width={56}
              style={{ borderRadius: '8px', objectFit: 'cover' }}
            />
          </div>
          <div className="dashboard-mobile-card__info">
            <h4 className="dashboard-mobile-card__title">{record?.name}</h4>
            <span className="dashboard-mobile-card__subtitle">
              <FiCalendar size={12} /> {moment(record?.createdAt).format("MMM Do YYYY")}
            </span>
          </div>
          <span className="dashboard-badge dashboard-badge--info">#{record?.position ?? 0}</span>
        </div>
        <div className="dashboard-mobile-card__body">
          <div className="dashboard-mobile-card__row">
            <span className="dashboard-mobile-card__label">
              <FiFolder size={14} /> Category
            </span>
            <span className="dashboard-mobile-card__value">{record?.category?.name ?? '-'}</span>
          </div>
          {record?.description && (
            <div className="dashboard-mobile-card__row">
              <span className="dashboard-mobile-card__label">Description</span>
              <span className="dashboard-mobile-card__value" style={{ fontSize: '12px', color: '#666' }}>
                {record?.description?.substring(0, 50)}{record?.description?.length > 50 ? '...' : ''}
              </span>
            </div>
          )}
        </div>
        <div className="dashboard-mobile-card__actions">
          <Button type="primary" ghost icon={<FiEdit2 size={14} />} size="small" onClick={() => edit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Delete subcategory"
            description="Are you sure to delete this Subcategory?"
            okText="Yes"
            cancelText="No"
            placement="topRight"
            onConfirm={() => mutationDelete.mutate(record?._id)}
          >
            <Button danger size="small" icon={<FiTrash2 size={14} />}>
              Delete
            </Button>
          </Popconfirm>
        </div>
      </div>
    ));
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
          rowKey={(record) => record?._id}
          scroll={{ x: "max-content" }}
          locale={{
            emptyText: (
              <div className="dashboard-mobile-card__empty">
                <FiLayers size={48} />
                <p>No subcategories yet</p>
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
          showTotal={(total: any) => `Total ${count ?? 0} Subcategory`}
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
