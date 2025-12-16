"use client";
import React from "react";
import API from "@/config/API_ADMIN";
import {
  Button,
  Table,
  Image,
  Tag,
  Popconfirm,
  Popover,
  Form,
  Input,
  Space,
  Pagination,
  Badge,
  notification,
} from "antd";
import { TbEdit } from "react-icons/tb";
import { MdDeleteOutline } from "react-icons/md";
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
      width: 100,
      render: (item: any, record: any) => (
        <div className="table-action">
          <Button type="text" size="small">
            <TbEdit size={22} color="orange" onClick={() => edit(record)} />
          </Button>

          <Popconfirm
            title="Delete the task"
            description="Are you sure to delete this Subcategory?"
            okText="Yes"
            cancelText="No"
            placement="bottomLeft"
            onConfirm={() => mutationDelete.mutate(record?._id)}
          >
            <Button type="text" size="small">
              <MdDeleteOutline size={22} color="red" />
            </Button>
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
            <Button type="text" size="small">
              <Badge size="small" count={record?.position}>
                <CgReorder size={22} />
              </Badge>
            </Button>
          </Popover>
        </div>
      ),
    },
  ];

  const [Notifications, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();
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
  return (
    <>
      {contextHolder}
      <Table
        dataSource={data}
        columns={columns}
        pagination={false}
        size="small"
      />
      <div className="table-pagination">
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
    </>
  );
}

export default DataTable;
