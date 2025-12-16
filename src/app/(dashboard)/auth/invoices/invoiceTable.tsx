"use client";
import { Button, Pagination, Table, notification } from "antd";
import moment from "moment";
import { MomentInput } from "moment";
import React from "react";
import { AiFillEdit, AiOutlineEye } from "react-icons/ai";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { reduxSettings } from "@/redux/slice/settingsSlice";
import API from "../../../../config/API";

function InvoiceTable(props: any) {
  const router = useRouter();
// const Settings = useSelector((state: any) => state.Settings.Settings);

const settings = useAppSelector(reduxSettings);
  const viewInvoicePage = (record: any) => {
    if (record?.id) {
      router.push(`/auth/invoices/viewinvoice/${record.id}`);
    }
  };

  const editInvoicePage = (record: any) => {
    console.log('iiiddd',record.id);
    if (record?.id) {
      router.push(`/auth/invoices/editinvoice/${record.id}`);
    }
  };
  const [Notifications, contextHolder] = notification.useNotification();
  const columns = [
    {
      title: "Invoice ID",
      dataIndex: "invoice_id",
      key: "invoice_id",
    },
    {
      title: "Customer Name",
      dataIndex: "to_name",
      key: "to_name",
    },
    {
      title: "Total",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (text: any) => (
        <span>
         {text}
         {settings.currency ?? ""}
        </span>
      ),
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      render: (text: any, record: any) => moment(text).format("DD/MM/YYYY"),
    },

    {
      title: "View",
      key: "actions",
      width: 50,
      render: (record: any) => (
        <div
          style={{
            display: "flex",
            justifyContent: "space-around",
            cursor: "pointer",
          }}
          onClick={() => viewInvoicePage(record)}
        >
          <AiOutlineEye size={25} color={API.COLOR} />
        </div>
      ),
    },

    {
      title: "Edit",
      key: "actions",
      width: 50,
      render: (_text: any, record: any) => (
        <div
          style={{ display: "flex", justifyContent: "space-around" }}
          onClick={() => editInvoicePage(record)}
        >
          <AiFillEdit cursor="pointer" size={25} color={API.COLOR} />
        </div>
      ),
    },
  ];

  return (
    <div>
      {contextHolder}
      <Table
        size="small"
        dataSource={props.data}
        columns={columns}
        onRow={(record, rowIndex) => {
          return {
            onClick: (event) => {},
          };
        }}
        pagination={false}
      />
      <div className="d-flex justify-content-center mt-3">
        <Pagination
          current={props?.page || 1}
          pageSize={props?.pageSize || 10}
          total={props?.meta?.itemCount || 0}
          defaultCurrent={1}
          responsive={true}
          defaultPageSize={props?.pageSize || 10}
          disabled={false}
          hideOnSinglePage={true}
          onChange={(current: any, size: any) => {
            props?.changePage(current);
          }}
        />
      </div>
    </div>
  );
}

export default InvoiceTable;
