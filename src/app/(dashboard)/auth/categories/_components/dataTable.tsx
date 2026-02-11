"use client";
import React, { useEffect, useState } from "react";
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
import { FiEdit2, FiTrash2, FiStar, FiImage, FiLayers } from "react-icons/fi";
import { MdHourglassEmpty } from "react-icons/md";
import { CgReorder } from "react-icons/cg";
import moment from "moment";
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DELETE, PUT } from "@/util/apicall";

interface DataTableProps {
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
}: DataTableProps) {
  const [Notifications, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const mutationDelete = useMutation({
    mutationFn: (id: number) => {
      return DELETE(API.CATEGORY + id);
    },
    onError: (error) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: () => {
      Notifications["success"]({
        message: `Category Deleted Successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin_category"] });
    },
  });

  const mutationUpdate = useMutation({
    mutationFn: (data: any) => {
      const obj = {
        position: Number(data?.position),
      };
      return PUT(API.CATEGORY_UPDATE_POSITION + data?.id, obj);
    },
    onError: (error) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: () => {
      Notifications["success"]({
        message: `Position Updated Successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin_category"] });
    },
  });

  const columns = [
    {
      title: "Category",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: any) => (
        <div className="table__user-cell">
          <div className="table-img" style={{ borderRadius: 8, overflow: 'hidden' }}>
            {record.image ? (
              <Image
                style={{ height: 40, width: 40, objectFit: "cover" }}
                src={record.image}
                preview={false}
              />
            ) : (
              <div style={{ 
                width: 40, 
                height: 40, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: '#f5f5f5'
              }}>
                <FiImage size={20} color="#999" />
              </div>
            )}
          </div>
          <div>
            <div className="table__user-name">{name || "N/A"}</div>
            {record.featured && (
              <span className="dashboard-badge dashboard-badge--warning" style={{ fontSize: 10, padding: '2px 6px' }}>
                <FiStar size={10} /> Featured
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text: string) => (
        <div className="table-desctext" style={{ maxWidth: 300 }}>
          {text || "No description"}
        </div>
      ),
      responsive: ["lg"] as any,
    },
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
      width: 100,
      render: (position: number) => (
        <span className="dashboard-badge dashboard-badge--info">
          <FiLayers size={12} /> #{position || 0}
        </span>
      ),
      responsive: ["md"] as any,
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => (
        <div className="table__date">
          {moment(date).format("MMM DD, YYYY")}
        </div>
      ),
      responsive: ["md"] as any,
    },
    {
      title: "Actions",
      width: 140,
      render: (_: any, record: any) => (
        <div className="table-action" style={{ gap: 4 }}>
          <Tooltip title="Edit">
            <Button 
              type="text" 
              size="small" 
              className="table__action-btn"
              onClick={() => edit(record)}
              icon={<FiEdit2 size={16} />}
            />
          </Tooltip>

          <Popconfirm
            title="Delete Category"
            description="Are you sure you want to delete this category?"
            okText="Delete"
            cancelText="Cancel"
            placement="bottomLeft"
            onConfirm={() => mutationDelete.mutate(record?.id)}
            okButtonProps={{ danger: true }}
          >
            <Tooltip title="Delete">
              <Button 
                type="text" 
                size="small" 
                className="table__action-btn"
                danger
                icon={<FiTrash2 size={16} />}
              />
            </Tooltip>
          </Popconfirm>

          <Popover
            title="Change Position"
            placement="bottomLeft"
            trigger="click"
            content={
              <Form
                initialValues={{ position: record?.position ?? 0 }}
                onFinish={(value) =>
                  mutationUpdate.mutate({
                    id: record?.id,
                    position: value?.position,
                  })
                }
              >
                <Space.Compact>
                  <Form.Item
                    style={{ marginBottom: 0 }}
                    name="position"
                    rules={[{ required: true, message: "Required" }]}
                  >
                    <Input style={{ width: 80 }} type="number" placeholder="0" />
                  </Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={mutationUpdate.isPending}
                  >
                    Save
                  </Button>
                </Space.Compact>
              </Form>
            }
          >
            <Tooltip title="Change Position">
              <Button type="text" size="small" className="table__action-btn">
                <Badge size="small" count={record?.position || 0} style={{ backgroundColor: '#3b82f6' }}>
                  <CgReorder size={18} />
                </Badge>
              </Button>
            </Tooltip>
          </Popover>
        </div>
      ),
    },
  ];

  // Mobile Card View
  const MobileCardView = () => (
    <div className="dashboard-mobile-cards">
      {data.length === 0 ? (
        <div className="dashboard-mobile-card">
          <div style={{ padding: 40, textAlign: 'center' }}>
            <MdHourglassEmpty size={40} color="#999" />
            <p style={{ color: '#666', marginTop: 16 }}>No Categories yet</p>
          </div>
        </div>
      ) : (
        data.map((category: any, index: number) => (
          <div key={category.id || index} className="dashboard-mobile-card">
            <div className="dashboard-mobile-card__header">
              <div className="dashboard-mobile-card__avatar">
                {category.image ? (
                  <Image
                    style={{ width: '100%', height: '100%', objectFit: "cover" }}
                    src={category.image}
                    preview={false}
                  />
                ) : (
                  <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: '#f5f5f5'
                  }}>
                    <FiImage size={24} color="#999" />
                  </div>
                )}
              </div>
              <div className="dashboard-mobile-card__title-group">
                <h4 className="dashboard-mobile-card__title">{category.name || "N/A"}</h4>
                <p className="dashboard-mobile-card__subtitle">
                  Position: #{category.position || 0}
                </p>
              </div>
              {category.featured && (
                <span className="dashboard-badge dashboard-badge--warning">
                  <FiStar size={10} /> Featured
                </span>
              )}
            </div>
            <div className="dashboard-mobile-card__body">
              <div className="dashboard-mobile-card__row">
                <span className="dashboard-mobile-card__label">Description</span>
                <span className="dashboard-mobile-card__value" style={{ maxWidth: 150, textAlign: 'right' }}>
                  {category.description?.slice(0, 30) || "No description"}
                  {category.description?.length > 30 ? '...' : ''}
                </span>
              </div>
              <div className="dashboard-mobile-card__row">
                <span className="dashboard-mobile-card__label">Created</span>
                <span className="dashboard-mobile-card__value">
                  {moment(category.createdAt).format("MMM DD, YYYY")}
                </span>
              </div>
            </div>
            <div className="dashboard-mobile-card__footer">
              <Button
                type="primary"
                ghost
                icon={<FiEdit2 />}
                onClick={() => edit(category)}
                style={{ flex: 1 }}
              >
                Edit
              </Button>
              <Popconfirm
                title="Delete Category"
                description="Are you sure?"
                okText="Delete"
                cancelText="Cancel"
                onConfirm={() => mutationDelete.mutate(category?.id)}
                okButtonProps={{ danger: true }}
              >
                <Button
                  type="default"
                  danger
                  icon={<FiTrash2 />}
                  style={{ flex: 1 }}
                >
                  Delete
                </Button>
              </Popconfirm>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <>
      {contextHolder}
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
            scroll={{ x: "max-content" }}
            locale={{
              emptyText: (
                <div className="table__empty-state">
                  <MdHourglassEmpty size={48} className="table__empty-icon" />
                  <p className="table__empty-text">No Categories yet</p>
                </div>
              ),
            }}
          />
        )}
        <div className="table__pagination-container">
          <Pagination
            showSizeChanger
            pageSize={pageSize}
            showTotal={(total) => `Total ${count ?? 0} Categories`}
            onChange={(page, pageSize) => {
              setPage(page);
              setTake(pageSize);
            }}
            total={count ?? 0}
            current={page}
            className="table__pagination"
          />
        </div>
      </div>
    </>
  );
}

export default DataTable;
