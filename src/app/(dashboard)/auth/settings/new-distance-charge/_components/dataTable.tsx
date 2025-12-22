"use client";
import React, { useReducer } from "react";
import { Button, Table, Popconfirm, notification } from "antd";
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
      title: "Country",
      dataIndex: "countryDetails",
      key: "country",
      width: 200,
      render: (country: any) => <div>{country?.country_name || "-"}</div>,
    },
    {
      title: "State",
      dataIndex: "stateDetails",
      key: "state",
      width: 200,
      render: (state: any) => <div>{state?.name || "-"}</div>,
    },
    {
      title: "Min Weight",
      dataIndex: "min_weight",
      key: "min_weight",
      width: 120,
      render: (weight: number) => <div>{weight} kg</div>,
    },
    {
      title: "Max Weight",
      dataIndex: "max_weight",
      key: "max_weight",
      width: 120,
      render: (weight: number) => <div>{weight} kg</div>,
    },
    {
      title: "Delivery Charge",
      dataIndex: "delivery_charge",
      key: "delivery_charge",
      width: 150,
      render: (charge: number) => <div>₦{charge?.toFixed(2)}</div>,
    },
    {
      title: "Action",
      width: 100,
      render: (item: any, record: any) => (
        <div className="table-action">
          <Button
            type="text"
            size="small"
            onClick={() =>
              router.push(`/auth/settings/new-distance-charge/${record?.id}`)
            }
          >
            <TbEye size={22} color="blue" />
          </Button>
          <Button
            type="text"
            size="small"
            onClick={() =>
              router.push(
                `/auth/settings/new-distance-charge/${record?.id}/edit`
              )
            }
          >
            <TbEdit size={22} color="orange" />
          </Button>

          <Popconfirm
            title="Delete Distance Charge"
            description="Are you sure to delete this distance charge?"
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
      return DELETE(API_ADMIN.NEW_DISTANCE_CHARGE + id);
    },
    onError: (error, variables, context) => {
      Notifications["error"]({
        message: error.message,
      });
    },
    onSuccess: (data, variables, context) => {
      setDeletePopconfirm({ type: "close" });
      Notifications["success"]({
        message: `Distance Charge Deleted Successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ["new-distance-charges"] });
    },
  });

  return (
    <>
      {contextHolder}
      <Table
        dataSource={data}
        columns={columns}
        size="small"
        pagination={{
          current: page,
          pageSize: take,
          total: count,
          onChange: (page, pageSize) => {
            setPage(page);
            setTake(pageSize);
          },
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
        }}
      />
    </>
  );
}

export default DataTable;
