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
import { IoCheckmarkCircleOutline } from "react-icons/io5";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DELETE, PUT } from "@/util/apicall";
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
      width: 400,
      render: (text: boolean) => <div className="table-desctext">{text}</div>,
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
      title: "Featured",
      dataIndex: "featured",
      key: "featured",
      width: 50,
      render: (item: boolean) => (
        <span>
          {item == true ? (
            <IoCheckmarkCircleOutline color="#008000" size={20} />
          ) : null}
        </span>
      ),
    },
    {
      title: "Action",
      width: 100,
      render: (item: any, record: any) => (
        <div className="table-action">
          <Button type="text" size="small" onClick={() => edit(record)}>
            <TbEdit size={22} color="orange" />
          </Button>

          <Popconfirm
            title="Delete the task"
            description="Are you sure to delete this Category?"
            okText="Yes"
            cancelText="No"
            placement="bottomLeft"
            onConfirm={() => mutationDelete.mutate(record?.id)}
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
                    id: record?.id,
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
      return DELETE(API.CATEGORY + id);
    },
    onError: (error, variables, context) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
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
    onError: (error, variables, context) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      Notifications["success"]({
        message: `Position Updated Successfully.`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin_category"] });
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
          showTotal={(total: any) => `Total ${count ?? 0} Category`}
          onChange={(page, pageSize) => {
            setPage(page);
            setTake(pageSize);
          }}
          total={count ?? 0}
          current={page}
        />
      </div>
    </>
  );
}

export default DataTable;
