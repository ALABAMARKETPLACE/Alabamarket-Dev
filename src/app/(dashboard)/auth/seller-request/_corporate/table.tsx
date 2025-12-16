"use client";
import React from "react";
import { Button, Table, Pagination } from "antd";
import { MdHourglassEmpty } from "react-icons/md";
import { useAppSelector } from "@/redux/hooks";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import { TfiMoreAlt } from "react-icons/tfi";
import { useRouter } from "next/navigation";
interface props {
  data: any[];
  count: number;
  setPage: Function;
  setTake: Function;
  pageSize: number;
  page: number;
}
function DataTable({ data, count, setPage, setTake, pageSize, page }: props) {
  const Settings = useAppSelector(reduxSettings);
  const rounter = useRouter();
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (item: string, record: any) => (
        <div>
          {record?.code ?? ""} {item}
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (item: string) => item,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
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
            onClick={() => rounter.push(`/auth/seller-request/corporate/${id}`)}
          >
            <TfiMoreAlt size={20} />
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
              <MdHourglassEmpty size={40} />
              <p>No Users yet</p>
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
          showTotal={(total: any) => `Total ${count ?? 0} Seller Request`}
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
