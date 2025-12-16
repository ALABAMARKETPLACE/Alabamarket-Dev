"use client";
import React from "react";
import { Button, Table, Pagination, Badge, Tag } from "antd";
import moment from "moment";
import { useAppSelector } from "@/redux/hooks";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import { FaFileInvoice } from "react-icons/fa6";
interface props {
  data: any[];
  count: number;
  setPage: (p: number, t: number) => void;
  pageSize: number;
  page: number;
}
function DataTable({ data, count, setPage, pageSize, page }: props) {
  const Settings = useAppSelector(reduxSettings);
  const columns = [
    {
      title: "Amount",
      dataIndex: "paid",
      key: "paid",
      render: (item: any) => (
        <span className="fw-medium">
          {Number(item)?.toFixed(2)} {Settings.currency}
        </span>
      ),
    },

    {
      title: "Balance", //
      dataIndex: "balance",
      key: "balance",
      render: (item: any) => (
        <span>
          {Number(item)?.toFixed(2)} {Settings.currency}
        </span>
      ),
    },
    {
      title: "Total Settled", //
      dataIndex: "total",
      key: "total",
      render: (item: any) => (
        <span>
          {Number(item)?.toFixed(2)} {Settings.currency}
        </span>
      ),
    },
    {
      title: "Payment Type", //
      dataIndex: "payment_type",
      key: "payment_type",
      render: (item: any) => <span>{item}</span>,
    },
    {
      title: "Payment Status", //
      dataIndex: "status",
      key: "status",
      render: (item: any) =>
        item == "success" ? <Tag color="green">{item}</Tag> : item,
    },
    {
      title: "Settlement Date", //
      dataIndex: "createdAt",
      key: "createdAt",
      render: (item: any) => <span>{moment(item).format("MMM Do YYYY")}</span>,
    },
  ];

  return (
    <>
      <Table
        dataSource={data}
        columns={columns}
        pagination={false}
        size="small"
        locale={{
          emptyText: (
            <div className="py-5">
              <FaFileInvoice size={40} />
              <p>No Settlements yet</p>
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
          showTotal={(total: any) => `Total ${count ?? 0} Entry`}
          onChange={(page, pageSize) => setPage(page, pageSize)}
        />
      </div>
    </>
  );
}

export default DataTable;
