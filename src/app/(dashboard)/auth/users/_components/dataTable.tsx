"use client";
import React from "react";
import { Button, Table, Tag, Pagination, Avatar } from "antd";
import { MdHourglassEmpty } from "react-icons/md";
import moment from "moment";
import { TfiMoreAlt } from "react-icons/tfi";
import { IoMdCheckmarkCircle } from "react-icons/io";
import { useRouter } from "next/navigation";
interface props {
  data: any[];
  count: number;
  setPage: (p: number, t: number) => void;
  pageSize: number;
  page: number;
}
function DataTable({ data, count, setPage, pageSize, page }: props) {
  const router = useRouter();
  const columns = [
    {
      title: "",
      dataIndex: "image",
      key: "image",
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
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (item: string, all: any) => (
        <span>
          {`${all.countrycode ? all.countrycode : ""} ${
            all.phone ? all.phone : ""
          }`}
          &nbsp;
          {all.phone_verify ? (
            <IoMdCheckmarkCircle color="green" size={20} />
          ) : null}
        </span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (item: string, all: any) => (
        <span>
          {item}
          &nbsp;
          {all.mail_verify ? (
            <IoMdCheckmarkCircle color="green" size={18} />
          ) : null}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: boolean) => (
        <Tag color={status ? "green" : "red"}>
          {status ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Joined Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 180,
      render: (item: string) => <span>{`${moment(item).format("lll")}`}</span>,
    },
    {
      title: "Action",
      dataIndex: "_id",
      key: "_id",
      width: 100,
      render: (id: number, record: any) => (
        <div className="table-action">
          <Button
            type="text"
            size="small"
            onClick={() => router.push(`/auth/users/${id}`)}
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
          showTotal={(total: any) => `Total ${count ?? 0} Users`}
          onChange={(page, pageSize) => setPage(page, pageSize)}
        />
      </div>
    </>
  );
}

export default DataTable;
