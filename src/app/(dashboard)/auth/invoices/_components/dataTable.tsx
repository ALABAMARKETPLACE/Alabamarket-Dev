"use client";
import React from "react";
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
} from "antd";
import { TbEdit } from "react-icons/tb";
import { MdDeleteOutline } from "react-icons/md";
import moment from "moment";
import { useAppSelector } from "@/redux/hooks";
import { reduxSettings } from "@/redux/slice/settingsSlice";
interface props {
  data: any[];
  count: number;
  setPage: Function;
  setTake: Function;
  pageSize: number;
  page: number;
}
function DataTable({ data, count, setPage, setTake, pageSize, page }: props) {
  const settings = useAppSelector(reduxSettings);
  const columns = [
    {
      title: "Invoice ID",
      dataIndex: "invoice_id",
      key: "invoice_id",
    },
    {
      title: "Customer Name",
      dataIndex: "to_name",
      key: "to_name",
    },
    {
      title: "Total",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (text: any) => (
        <span>
          {text}
          {settings.currency ?? ""}
        </span>
      ),
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      render: (text: any, record: any) => moment(text).format("DD/MM/YYYY"),
    },
    {
      title: "Action",
      width: 100,
      render: (item: any, record: any) => (
        <div className="table-action">
          <Popconfirm
            title="Delete the Invoice"
            description="Are you sure to delete this Invoice?"
            okText="Yes"
            cancelText="No"
            placement="bottomLeft"
          >
            <Button type="text" size="small">
              <MdDeleteOutline size={22} color="red" />
            </Button>
          </Popconfirm>
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
        locale={{ emptyText: "No Invoice" }}
      />
      <div className="table-pagination">
        <Pagination
          showSizeChanger
          pageSize={pageSize}
          showTotal={(total: any) => `Total ${count ?? 0} Invoice`}
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
