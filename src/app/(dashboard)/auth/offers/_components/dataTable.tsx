"use client";
import React from "react";
import API from "@/config/API_ADMIN";
import {
  Button,
  Table,
  Image,
  Popconfirm,
  Pagination,
  notification,
} from "antd";
import { TbEdit } from "react-icons/tb";
import { MdDeleteOutline } from "react-icons/md";
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
      width: 180,
      render: (item: boolean) => (
        <span>{item == true ? "Active" : "Inactive"}</span>
      ),
    },
    ...(session?.role == "admin"
      ? [
          {
            title: "Action",
            width: 100,
            render: (item: any, record: any) => (
              <div className="table-action">
                <>
                  <Button type="text" size="small" onClick={() => edit(record)}>
                    <TbEdit size={22} color="orange" />
                  </Button>
                  <Popconfirm
                    title="Delete the Offer"
                    description="Are you sure to delete this Offer?"
                    okText="Yes"
                    cancelText="No"
                    placement="bottomLeft"
                    onConfirm={() => mutationDelete.mutate(record?.id)}
                    okButtonProps={{ loading: mutationDelete.isPending }}
                  >
                    <Button type="text" size="small">
                      <MdDeleteOutline size={22} color="red" />
                    </Button>
                  </Popconfirm>
                </>
              </div>
            ),
          },
        ]
      : []),
  ];

  const [Notifications, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();
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
          showTotal={(total: any) => `Total ${count ?? 0} Offers`}
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
