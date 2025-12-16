"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Button, Table, Pagination, Avatar } from "antd";
import { TbListDetails } from "react-icons/tb";
import moment from "moment";
import { useAppSelector } from "@/redux/hooks";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import { useRouter } from "next/navigation";
import { FaEye } from "react-icons/fa6";
import CONFIG from "@/config/configuration";

interface props {
  data: any[];
  count: number;
  setPage: (p: number, take: number) => void;
  pageSize: number;
  page: number;
}

function DataTable({ data, count, setPage, pageSize, page }: props) {
  const route = useRouter();
  const Settings = useAppSelector(reduxSettings);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const columnPaddingStyle = useMemo(() => ({ padding: "12px 16px" }), []);

  const columns = useMemo(
    () => [
      {
        title: "",
        dataIndex: "image",
        key: "image",
        render: (img: string) => <Avatar size={35} src={img} shape="square" />,
        onCell: () => ({ style: columnPaddingStyle }),
        onHeaderCell: () => ({ style: columnPaddingStyle }),
      },
      {
        title: "OrderId",
        dataIndex: "order_id",
        key: "order_id",
        onCell: () => ({ style: columnPaddingStyle }),
        onHeaderCell: () => ({ style: columnPaddingStyle }),
      },
      {
        title: "User Name",
        dataIndex: "name",
        key: "userId",
        onCell: () => ({ style: columnPaddingStyle }),
        onHeaderCell: () => ({ style: columnPaddingStyle }),
      },
      {
        title: "OrderDate", //
        dataIndex: "createdAt",
        key: "createdAt",
        render: (item: any) => (
          <span>{moment(item).format("MMM Do YYYY")}</span>
        ),
        onCell: () => ({ style: columnPaddingStyle }),
        onHeaderCell: () => ({ style: columnPaddingStyle }),
      },
      {
        title: "Total", //
        dataIndex: "grandTotal",
        key: "grandTotal",
        render: (item: any) => (
          <span>
            {Number(item)?.toFixed(2)} {Settings.currency}
          </span>
        ),
        onCell: () => ({ style: columnPaddingStyle }),
        onHeaderCell: () => ({ style: columnPaddingStyle }),
      },
      {
        title: "Status", //
        dataIndex: "status",
        key: "status",
        render: (item: string) => <span>{item}</span>,
        onCell: () => ({ style: columnPaddingStyle }),
        onHeaderCell: () => ({ style: columnPaddingStyle }),
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
        onCell: () => ({ style: columnPaddingStyle }),
        onHeaderCell: () => ({ style: columnPaddingStyle }),
      },
    ],
    [route, Settings.currency, columnPaddingStyle]
  );

  const renderMobileCards = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0) {
      return (
        <div className="orders-tableMobileEmpty">
          <TbListDetails size={40} />
          <p>No Orders yet</p>
        </div>
      );
    }

    return data.map((record: any) => {
      const orderId = record?.order_id ?? record?._id ?? record?.id;
      const createdAt = record?.createdAt
        ? moment(record.createdAt).format("MMM Do YYYY")
        : "-";
      const total =
        typeof record?.grandTotal === "number"
          ? `${Number(record?.grandTotal).toFixed(2)} ${
              Settings?.currency ?? ""
            }`
          : "--";

      return (
        <div className="orders-tableMobileCard" key={orderId}>
          <div className="orders-tableMobileHeader">
            <Avatar
              size={40}
              src={record?.image}
              shape="square"
              className="orders-tableMobileAvatar"
            />
            <div className="orders-tableMobileTitle">
              <div className="title">#{record?.order_id ?? "--"}</div>
              <div className="sub">{record?.name ?? "Unknown user"}</div>
            </div>
            <div className="orders-tableMobileStatus">
              {record?.status ?? "-"}
            </div>
          </div>
          <div className="orders-tableMobileBody">
            <div className="orders-tableMobileRow">
              <span className="label">Date</span>
              <span className="value">{createdAt}</span>
            </div>
            <div className="orders-tableMobileRow">
              <span className="label">Total</span>
              <span className="value">{total}</span>
            </div>
          </div>
          <div className="orders-tableMobileActions">
            <Button
              type="primary"
              ghost
              icon={<FaEye size={16} color={CONFIG.COLOR} />}
              size="small"
              onClick={() => route.push("/auth/orders/" + record?.order_id)}
            >
              View
            </Button>
          </div>
        </div>
      );
    });
  }, [Settings?.currency, data, route]);

  return (
    <>
      {!isMobile ? (
        <Table
          dataSource={data}
          columns={columns}
          pagination={false}
          size="small"
          rowKey={(record) => record?.order_id ?? record?._id ?? record?.id}
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
      ) : (
        <div className="orders-tableMobile">{renderMobileCards}</div>
      )}
      <div className="table-pagination">
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
    </>
  );
}

export default DataTable;
