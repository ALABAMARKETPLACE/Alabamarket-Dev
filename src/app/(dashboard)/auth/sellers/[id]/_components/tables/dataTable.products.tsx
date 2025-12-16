"use client";
import React from "react";
import { Button, Table, Image, Tag, Pagination } from "antd";
import { TbEdit } from "react-icons/tb";
import moment from "moment";
import { useAppSelector } from "@/redux/hooks";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import { AiOutlineProduct } from "react-icons/ai";
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
      title: "Quantity",
      dataIndex: "unit",
      key: "unit",
      //   responsive: ["md"],
      render: (item: any) => (
        <span>
          {item == 0 ? (
            <span className="text-danger">{"Out of stock"}</span>
          ) : (
            <span>{item}</span>
          )}
        </span>
      ),
    },
    {
      title: "Price",
      dataIndex: "retail_rate",
      key: "price",
      render: (item: number) => (
        <span>
          {Number(item)?.toFixed(2)} {Settings?.currency ?? ""}
        </span>
      ),
      //   responsive: ["md"],
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (item: boolean) => (
        <>
          {item == true ? (
            <Tag color="success" bordered={false}>
              Active
            </Tag>
          ) : item == false ? (
            <Tag color="warning" bordered={false}>
              Inactive
            </Tag>
          ) : (
            <Tag color="success" bordered={false}>
              Unknown
            </Tag>
          )}
        </>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (text: any, record: any) => {
        return <div>{moment(text).format("MMM Do YYYY")}</div>;
      },
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
              <AiOutlineProduct size={40} />
              <p>No Products yet</p>
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
          showTotal={(total: any) => `Total ${count ?? 0} Products`}
          onChange={(page, pageSize) => {
            setPage(page, pageSize);
          }}
        />
      </div>
    </>
  );
}

export default DataTable;
