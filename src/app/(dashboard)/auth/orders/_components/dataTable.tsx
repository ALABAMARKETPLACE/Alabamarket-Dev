"use client";
import React, { useMemo, useEffect, useState } from "react";
import { Button, Table, Pagination, Avatar, Card } from "antd";
import { TbListDetails } from "react-icons/tb";
import moment from "moment";
import { useAppSelector } from "@/redux/hooks";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import { useRouter } from "next/navigation";
import { FaEye } from "react-icons/fa6";
import CONFIG from "@/config/configuration";
import { formatCurrency } from "@/utils/formatNumber";
import { GET } from "@/util/apicall";
import API from "@/config/API_ADMIN";

interface props {
  data: any[];
  count: number;
  setPage: (p: number, take: number) => void;
  pageSize: number;
  page: number;
}

const UserName = ({ userId }: { userId: number }) => {
  const [name, setName] = useState<string>("Loading...");

  useEffect(() => {
    let isMounted = true;
    if (userId) {
      GET(API.USER_DETAILS + userId)
        .then((res: any) => {
          if (isMounted) {
            setName(res?.data?.name || "N/A");
          }
        })
        .catch(() => {
          if (isMounted) {
            setName("N/A");
          }
        });
    } else {
        setName("N/A");
    }
    return () => {
      isMounted = false;
    };
  }, [userId]);

  return <span>{name}</span>;
};

function DataTable({ data, count, setPage, pageSize, page }: props) {
  const route = useRouter();
  const Settings = useAppSelector(reduxSettings);

  const columns = useMemo(
    () => [
      {
        title: "",
        dataIndex: "image",
        key: "image",
        width: 60,
        render: (img: string) => <Avatar size={35} src={img} shape="square" />,
      },
      {
        title: "OrderId",
        dataIndex: "order_id",
        key: "order_id",
      },
      {
        title: "User Name",
        dataIndex: "userId",
        key: "userId",
        render: (userId: number, record: any) => (
            record?.name ? record.name : <UserName userId={userId} />
        ),
      },
      {
        title: "OrderDate", //
        dataIndex: "createdAt",
        key: "createdAt",
        render: (item: any) => (
          <span>{moment(item).format("MMM Do YYYY")}</span>
        ),
      },
      {
        title: "Total", //
        dataIndex: "grandTotal",
        key: "grandTotal",
        render: (item: any) => (
          <span>
            {Settings.currency === "NGN" ? "₦" : Settings.currency}{" "}
            {formatCurrency(item)}
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
        render: (item: any, record: any) => (
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
    ],
    [route, Settings.currency]
  );

  return (
    <>
      <Card className="shadow-sm" bordered={false}>
        <Table
          dataSource={data}
          columns={columns}
          pagination={false}
          size="small"
          rowKey={(record) => record?.order_id ?? record?._id ?? record?.id}
          scroll={{ x: "max-content" }}
          locale={{
            emptyText: (
              <div
                className="orders-tableEmpty"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "40px 0",
                  textAlign: "center",
                  gap: 8,
                }}
              >
                <TbListDetails size={40} />
                <p>No Orders yet</p>
              </div>
            ),
          }}
        />
        <div className="table-pagination mt-4 flex justify-end">
          <Pagination
            showSizeChanger
            pageSize={pageSize}
            current={page}
            total={count ?? 0}
            showTotal={() => `Total ${count ?? 0} Orders`}
            onChange={(nextPage, nextPageSize) => {
              setPage(nextPage, nextPageSize);
            }}
          />
        </div>
      </Card>
    </>
  );
}

export default DataTable;
