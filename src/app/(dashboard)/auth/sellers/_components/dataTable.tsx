"use client";
import React from "react";
import { Button, Table, Pagination, Avatar } from "antd";
import { useAppSelector } from "@/redux/hooks";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import { FaEye } from "react-icons/fa6";
import CONFIG from "@/config/configuration";
import { useRouter } from "next/navigation";
interface props {
  data: any[];
  count: number;
  setPage: (p: number, t: number) => void;
  pageSize: number;
  page: number;
}
function DataTable({ data, count, setPage, pageSize, page }: props) {
  const settings = useAppSelector(reduxSettings);
  const router = useRouter();
  const columns = [
    {
      title: "",
      dataIndex: "logo_upload",
      key: "logo_upload",
      render: (img: string) => (
        <Avatar
          size={35}
          src={
            img
              ? img
              : "https://bairuha-bucket.s3.ap-south-1.amazonaws.com/nextmiddleeast/profileicon.png"
          }
        />
      ),
    },
    {
      title: "Store Name",
      dataIndex: "store_name",
      key: "store_name",
    },
    {
      title: "Owner Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (item: string, record: any) => (
        <span>
          {record?.code ?? ""} {item}
        </span>
      ),
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      render: (item: string) => `₦${item}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (item: string) => (
        <span className={item == "approved" ? "text-success" : "text-danger"}>
          {item}
        </span>
      ),
    },
    {
      title: "Action",
      dataIndex: "id",
      key: "id",
      width: 100,
      render: (id: number, record: any) => (
        <div className="table-action">
          <Button
            type="text"
            size="small"
            onClick={() => router.push(`/auth/sellers/${id}`)}
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
      />
      <div className="table-pagination">
        <Pagination
          showSizeChanger
          pageSize={pageSize}
          current={page}
          total={count ?? 0}
          showTotal={(total: any) => `Total ${count ?? 0} Sellers`}
          onChange={(page, pageSize) => {
            setPage(page, pageSize);
          }}
        />
      </div>
    </>
  );
}

export default DataTable;
