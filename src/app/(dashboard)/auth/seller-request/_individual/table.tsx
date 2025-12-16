"use client";
import React from "react";
import { Button, Table, Pagination } from "antd";
import { MdHourglassEmpty } from "react-icons/md";
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
  const router = useRouter();
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
      render: (item: string) => item,
    },
    {
      title: "Action",
      dataIndex: "id",
      key: "id",
      width: 100,
      render: (id: string, record: any) => (
        <div className="table-action">
          <Button
            type="text"
            size="small"
            onClick={() => router.push(`/auth/seller-request/individual/${id}`)}
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
