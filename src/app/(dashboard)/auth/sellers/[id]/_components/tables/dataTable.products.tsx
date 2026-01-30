"use client";
import React, { useMemo } from "react";
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

  // Responsive columns configuration
  const columns = useMemo(
    () => [
      {
        title: "Image",
        dataIndex: "image",
        key: "image",
        width: 60,
        responsive: ["md"],
        render: (item: string) => (
          <div className="table__image-wrapper">
            <Image
              className="table__image"
              src={item}
              alt="Product"
              preview={false}
            />
          </div>
        ),
      },
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        ellipsis: true,
        render: (text: string) => (
          <span className="table__text--primary">{text}</span>
        ),
      },
      {
        title: "Qty",
        dataIndex: "unit",
        key: "unit",
        width: 80,
        responsive: ["lg"],
        render: (item: any) => (
          <span
            className={`table__badge ${
              item === 0 ? "table__badge--danger" : "table__badge--success"
            }`}
          >
            {item === 0 ? "Out" : item}
          </span>
        ),
      },
      {
        title: "Price",
        dataIndex: "retail_rate",
        key: "price",
        width: 100,
        responsive: ["md"],
        render: (item: number) => (
          <span className="table__price">
            {Number(item)?.toFixed(2)} {Settings?.currency ?? ""}
          </span>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 90,
        responsive: ["md"],
        render: (item: boolean) => (
          <Tag
            color={
              item === true ? "success" : item === false ? "warning" : "default"
            }
            bordered={false}
            className="table__tag"
          >
            {item === true ? "Active" : item === false ? "Inactive" : "Unknown"}
          </Tag>
        ),
      },
      {
        title: "Date",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 110,
        responsive: ["lg"],
        render: (text: any) => (
          <span className="table__date">
            {moment(text).format("MMM DD, YY")}
          </span>
        ),
      },
    ],
    [Settings?.currency]
  );

  return (
    <div className="table-container">
      <div className="table-wrapper">
        <Table
          dataSource={data}
          columns={columns}
          pagination={false}
          size="middle"
          scroll={{ x: 600 }}
          className="dashboard-table"
          locale={{
            emptyText: (
              <div className="table__empty-state">
                <AiOutlineProduct className="table__empty-icon" />
                <p className="table__empty-text">No products yet</p>
              </div>
            ),
          }}
        />
      </div>

      {/* Pagination */}
      {count > 0 && (
        <div className="table__pagination-container">
          <Pagination
            showSizeChanger
            showQuickJumper
            pageSize={pageSize}
            current={page}
            total={count ?? 0}
            pageSizeOptions={[10, 20, 50, 100]}
            showTotal={(total: any) => `Total ${total} Products`}
            onChange={(p, size) => setPage(p, size)}
            className="table__pagination"
          />
        </div>
      )}
    </div>
  );
}

export default DataTable;
