"use client";

import { Button, Table, Pagination, Avatar, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { TbListDetails } from "react-icons/tb";
import moment from "moment";
import { useAppSelector } from "@/redux/hooks";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import { useRouter } from "next/navigation";
import { FaEye } from "react-icons/fa6";
import CONFIG from "@/config/configuration";
import { useMemo } from "react";

type OrderId = string | number;
interface OrderRow {
  image?: string;
  order_id: OrderId;
  name: string;
  createdAt: string | number | Date;
  grandTotal: number | string;
  status: string;
}

interface props {
  data: OrderRow[];
  count: number;
  setPage: (page: number) => void;
  setTake: (size: number) => void;
  pageSize: number;
  page: number;
}

function DataTable({ data, count, setPage, setTake, pageSize, page }: props) {
  const route = useRouter();
  const Settings = useAppSelector(reduxSettings);

  const columns: ColumnsType<OrderRow> = useMemo(
    () => [
      {
        title: "",
        dataIndex: "image",
        key: "image",
        width: 50,
<<<<<<< HEAD
        responsive: ["md" as const],
=======
        responsive: ["md"],
>>>>>>> b6726a9 (Done)
        render: (img: string | undefined) => (
          <div className="table__image-wrapper">
            <Avatar
              size={35}
              src={img}
              shape="square"
              className="table__avatar"
            />
          </div>
        ),
      },
      {
        title: "Order ID",
        dataIndex: "order_id",
        key: "order_id",
        width: 120,
        ellipsis: true,
        render: (text: OrderId) => (
          <span className="table__text--primary table__code">{text}</span>
        ),
      },
      {
        title: "Customer",
        dataIndex: "name",
        key: "userId",
        ellipsis: true,
        render: (text: string) => (
          <span className="table__text--secondary">{text}</span>
        ),
      },
      {
        title: "Date",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 110,
<<<<<<< HEAD
        responsive: ["lg" as const],
=======
        responsive: ["lg"],
>>>>>>> b6726a9 (Done)
        render: (item: string | number | Date) => (
          <span className="table__date">
            {moment(item).format("MMM DD, YY")}
          </span>
        ),
      },
      {
        title: "Amount",
        dataIndex: "grandTotal",
        key: "grandTotal",
        width: 110,
<<<<<<< HEAD
        responsive: ["md" as const],
=======
        responsive: ["md"],
>>>>>>> b6726a9 (Done)
        render: (item: number | string) => (
          <span className="table__amount">
            {Number(item)?.toFixed(2)} {Settings?.currency ?? ""}
          </span>
        ),
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        width: 100,
<<<<<<< HEAD
        responsive: ["md" as const],
        render: (status: string) => {
          let color = "default";
          const displayStatus =
            status?.charAt(0)?.toUpperCase() + status?.slice(1);
=======
        responsive: ["md"],
        render: (status: string) => {
          let color = "default";
          const displayStatus = status?.charAt(0)?.toUpperCase() + status?.slice(1);
>>>>>>> b6726a9 (Done)

          if (status === "pending") {
            color = "processing";
          } else if (status === "completed") {
            color = "success";
          } else if (status === "cancelled") {
            color = "error";
          } else if (status === "shipped") {
            color = "cyan";
          }

          return (
            <Tag
              color={color}
              bordered={false}
              className="table__tag table__tag--status"
            >
              {displayStatus}
            </Tag>
          );
        },
      },
      {
        title: "Action",
        key: "action",
        width: 70,
        fixed: "right",
        render: (_: unknown, record: OrderRow) => (
          <Button
            type="text"
            size="small"
            icon={<FaEye size={16} />}
            onClick={() => route.push("/auth/orders/" + record?.order_id)}
            className="table__action-btn"
            title="View order"
          />
        ),
      },
    ],
<<<<<<< HEAD
    [Settings?.currency, route],
=======
    [Settings?.currency, route]
>>>>>>> b6726a9 (Done)
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
                <TbListDetails className="table__empty-icon" />
                <p className="table__empty-text">No orders yet</p>
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
            showTotal={(_total: number, _range: [number, number]) => {
              void _total;
              void _range;
              return `Total ${count ?? 0} Orders`;
            }}
            onChange={(page, pageSize) => {
              setPage(page);
              setTake(pageSize);
            }}
            className="table__pagination"
          />
        </div>
      )}
    </div>
  );
}

export default DataTable;
