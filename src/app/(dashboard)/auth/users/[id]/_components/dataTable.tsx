"use client";
import React from "react";
import { Button, Table, Pagination } from "antd";
import { TbListDetails } from "react-icons/tb";
import moment from "moment";
import { useAppSelector } from "@/redux/hooks";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import { useRouter } from "next/navigation";
import { FaEye } from "react-icons/fa6";
import CONFIG from "@/config/configuration";
import { Order } from "../../../orders/_components/dataTable";

interface props {
  data: Order[];
  count: number;
  setPage: (page: number) => void;
  setTake: (take: number) => void;
  pageSize: number;
  page: number;
}
function DataTable({ data, count, setPage, setTake, pageSize, page }: props) {
  const route = useRouter();
  const Settings = useAppSelector(reduxSettings);
  const columns = [
    {
      title: "OrderId",
      dataIndex: "order_id",
      key: "order_id",
    },
    {
      title: "OrderDate", //
      dataIndex: "createdAt",
      key: "createdAt",
      render: (item: string) => <span>{moment(item).format("MMM Do YYYY")}</span>,
    },
    {
      title: "Total", //
      dataIndex: "grandTotal",
      key: "grandTotal",
      render: (item: number) => (
        <span>
          {Number(item)?.toFixed(2)} {Settings.currency}
        </span>
      ),
    },
    {
      title: "Status", //
      dataIndex: "status",
      key: "status",
      render: (item: string) => <span>{item}</span>,
    },
    {
      title: "Action",
      width: 100,
      render: (_: unknown, record: Order) => (
        <div className="table-action">
          <Button
            type="text"
            size="small"
            onClick={() =>
              route.push(
                "/auth/orders/" +
                  (record?._id ?? record?.id ?? record?.order_id),
              )
            }
          >
            <FaEye size={22} color={CONFIG.COLOR} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Table
        dataSource={data}
        columns={columns}
        pagination={false}
        size="small"
        rowKey={(record) =>
          (record?._id ??
            record?.id ??
            record?.order_id ??
            "unknown") as React.Key
        }
        locale={{
          emptyText: (
            <div className="py-5">
              <TbListDetails size={40} />
              <p>No Orders yet</p>
            </div>
          ),
        }}
      />
      <div className="table-pagination">
        <Pagination
          showSizeChanger
          pageSize={pageSize}
          current={page}
          total={count ?? 0}
          showTotal={() => `Total ${count ?? 0} Orders`}
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
