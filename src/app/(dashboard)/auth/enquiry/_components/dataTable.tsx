"use client";
import React from "react";
import API from "@/config/API_ADMIN";
import { Button, Table, Popconfirm, Pagination, notification } from "antd";
import { MdDeleteOutline } from "react-icons/md";
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
  const columns = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
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
      width: 100,
      render: (id: number, record: any) => (
        <div className="table-action">
          <Popconfirm
            title="Delete the Enquiry"
            description="Are you sure to delete this Enquiry?"
            okText="Yes"
            cancelText="No"
            placement="bottomLeft"
            onConfirm={() => mutationDelete.mutate(id)}
          >
            <Button type="text" size="small">
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

  return (
    <>
      <Table
        dataSource={data}
        columns={columns}
        pagination={false}
        size="small"
        locale={{ emptyText: "No Enquiry" }}
      />
      <div className="table-pagination">
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
    </>
  );
}

export default DataTable;
