"use client";
import React, { useReducer } from "react";
import { Button, Table, Popconfirm, notification, Tag } from "antd";
import { TbEdit, TbEye } from "react-icons/tb";
import { MdDeleteOutline } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DELETE } from "@/util/apicall";
import { useRouter } from "next/navigation";
import API_ADMIN from "@/config/API_ADMIN";

interface PopconfirmState {
  open: boolean;
  id: number;
}

interface props {
  data: any[];
  page: number;
  take: number;
  count: number;
  setPage: (page: number) => void;
  setTake: (take: number) => void;
}

function DataTable({ data, page, take, count, setPage, setTake }: props) {
  const router = useRouter();
  const [deletePopconfirm, setDeletePopconfirm] = useReducer(
    (state: PopconfirmState, action: any) => {
      if (action.type === "open") return { open: true, id: action.id };
      return { open: false, id: -1 };
    },
    { open: false, id: -1 }
  );

  const columns = [
    {
      title: "Plan Name",
      dataIndex: "name",
      key: "name",
      width: 200,
      render: (name: string) => (
        <div style={{ fontWeight: 600, color: "#262941" }}>{name}</div>
      ),
    },
    {
      title: "Product Range",
      key: "product_range",
      width: 180,
      render: (record: any) => (
        <div>
          {record.min_products} - {record.max_products} products
        </div>
      ),
    },
    {
      title: "Duration",
      dataIndex: "duration_days",
      key: "duration_days",
      width: 120,
      render: (days: number) => (
        <div style={{ fontWeight: 500 }}>{days || 0} days</div>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: 150,
      render: (price: any) => (
        <div style={{ fontWeight: 500, color: "#a10244" }}>
          ₦{Number(price || 0).toFixed(2)}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      width: 120,
      render: (isActive: boolean) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
      width: 150,
      render: (date: string) => (
        <div>{new Date(date).toLocaleDateString()}</div>
      ),
    },
    {
      title: "Action",
      width: 120,
      fixed: "right" as const,
      render: (item: any, record: any) => (
        <div className="table-action">
          <Button
            type="text"
            size="small"
            onClick={() =>
              router.push(`/auth/settings/subscription-plans/${record?.id}`)
            }
          >
            <TbEye size={22} color="blue" />
          </Button>
          <Button
            type="text"
            size="small"
            onClick={() =>
              router.push(
                `/auth/settings/subscription-plans/${record?.id}/edit`
              )
            }
          >
            <TbEdit size={22} color="orange" />
          </Button>

          <Popconfirm
            title="Delete Subscription Plan"
            description="Are you sure to delete this subscription plan?"
            okText="Yes"
            cancelText="No"
            onCancel={() => setDeletePopconfirm({ type: "close" })}
            placement="bottomLeft"
            onConfirm={() => mutationDelete.mutate(record?.id)}
            open={deletePopconfirm?.open && record?.id === deletePopconfirm?.id}
            okButtonProps={{ loading: mutationDelete.isPending }}
          >
            <Button
              type="text"
              size="small"
              onClick={() =>
                setDeletePopconfirm({ type: "open", id: record?.id })
              }
            >
              <MdDeleteOutline size={22} color="red" />
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const [Notifications, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();

  const mutationDelete = useMutation({
    mutationFn: (id: number) => {
      return DELETE(API_ADMIN.SUBSCRIPTION_PLANS + id);
    },
    onError: (error, variables, context) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      setDeletePopconfirm({ type: "close" });
      Notifications["success"]({
        message: `Subscription Plan Deleted Successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
    },
  });

  return (
    <>
      {contextHolder}
      <Table
        dataSource={data}
        columns={columns}
        size="small"
        scroll={{ x: 800 }}
        pagination={{
          current: page,
          pageSize: take,
          total: count,
          onChange: (page, pageSize) => {
            setPage(page);
            setTake(pageSize);
          },
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} plans`,
        }}
      />
    </>
  );
}

export default DataTable;
