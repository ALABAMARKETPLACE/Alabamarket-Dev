"use client";
import React, { useReducer } from "react";
import { Button, Table, Popconfirm, notification } from "antd";
import { TbEdit } from "react-icons/tb";
import { MdDeleteOutline } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DELETE } from "@/util/apicall";
import { popconfirmReducer } from "./reducer";
import API from "@/config/API_ADMIN";
interface props {
  data: any[];
  edit: Function;
}
function DataTable({ data, edit }: props) {
  const columns = [
    {
      title: "Title",
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
      title: "Action",
      width: 60,
      render: (item: any, record: any) => (
        <div className="table-action">
          <Button type="text" size="small" onClick={() => edit(record)}>
            <TbEdit size={22} color="orange" />
          </Button>

          <Popconfirm
            title="Delete the task"
            description="Are you sure to delete this Business Type?"
            okText="Yes"
            cancelText="No"
            onCancel={() => dispatch({ type: "close" })}
            placement="bottomLeft"
            onConfirm={() => mutationDelete.mutate(record?.id)}
            open={deletePopconfim?.open && record?.id === deletePopconfim?.id}
            okButtonProps={{ loading: mutationDelete.isPending }}
          >
            <Button
              type="text"
              size="small"
              onClick={() => dispatch({ type: "open", id: record?.id })}
            >
              <MdDeleteOutline size={22} color="red" />
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];
  const [deletePopconfim, dispatch] = useReducer(popconfirmReducer, {
    open: false,
    id: -1,
  });
  const [Notifications, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();
  const mutationDelete = useMutation({
    mutationFn: (id: number) => {
      return DELETE(API.BUSINESS_TYPE + id);
    },
    onError: (error, variables, context) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      dispatch({ type: "close" });
      Notifications["success"]({
        message: `Business Type Deleted Successfully`,
      });
      queryClient.invalidateQueries({ queryKey: [API.BUSINESS_TYPE] });
    },
  });

  return (
    <>
      {contextHolder}
      <Table dataSource={data} columns={columns} size="small" />
    </>
  );
}

export default DataTable;
