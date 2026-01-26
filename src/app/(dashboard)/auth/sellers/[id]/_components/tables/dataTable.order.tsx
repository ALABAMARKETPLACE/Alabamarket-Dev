"use client";

import { Button, Table, Pagination, Avatar } from "antd";
import type { ColumnsType } from "antd/es/table";
import { TbListDetails } from "react-icons/tb";
import moment from "moment";
import { useAppSelector } from "@/redux/hooks";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import { useRouter } from "next/navigation";
import { FaEye } from "react-icons/fa6";
import CONFIG from "@/config/configuration";

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
  const columns: ColumnsType<OrderRow> = [
    {
      title: "",
      dataIndex: "image",
      key: "image",
      render: (img: string | undefined) => (
        <Avatar size={35} src={img} shape="square" />
      ),
    },
    {
      title: "OrderId",
      dataIndex: "order_id",
      key: "order_id",
    },
    {
      title: "User Name",
      dataIndex: "name",
      key: "userId",
    },
    {
      title: "OrderDate", //
      dataIndex: "createdAt",
      key: "createdAt",
      render: (item: string | number | Date) => (
        <span>{moment(item).format("MMM Do YYYY")}</span>
      ),
    },
    {
      title: "Total", //
      dataIndex: "grandTotal",
      key: "grandTotal",
      render: (item: number | string) => (
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
      render: (_: unknown, record: OrderRow) => (
        <div className="table-action">
          <Button
            type="text"
            size="small"
            onClick={() => route.push("/auth/orders/" + record?.order_id)}
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
          showTotal={(_total: number, _range: [number, number]) => {
            void _total;
            void _range;
            return `Total ${count ?? 0} Orders`;
          }}
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
