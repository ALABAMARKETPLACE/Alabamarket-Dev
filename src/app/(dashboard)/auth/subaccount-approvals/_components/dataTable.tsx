"use client";
import React, { useState } from "react";
import { Button, Table, Pagination, Tag } from "antd";
import moment from "moment";
import { MdHourglassEmpty } from "react-icons/md";
import ActionModal from "./actionModal";

interface props {
  data: any[];
  count: number;
  setPage: Function;
  setTake: Function;
  pageSize: number;
  page: number;
}

function DataTable({ data, count, setPage, setTake, pageSize, page }: props) {
  const [openModal, setOpenModal] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);

  const columns = [
    {
      title: "Store Name",
      dataIndex: "store_name",
      key: "store_name",
      width: 150,
      fixed: "left",
      render: (text: string, record: any) => (
        <span className="font-medium">{text || record.store?.store_name || "N/A"}</span>
      ),
    },
    {
      title: "Seller Name",
      dataIndex: "seller_name",
      key: "seller_name",
      width: 150,
      render: (text: string, record: any) => (
        <span>{text || record.store?.seller_name || "N/A"}</span>
      ),
    },
    {
      title: "Bank Name",
      dataIndex: "settlement_bank",
      key: "settlement_bank",
      width: 150,
      render: (text: string, record: any) => (
        <span>{text || record.bank_name || "N/A"}</span>
      ),
    },
    {
      title: "Account Number",
      dataIndex: "settlement_account_number",
      key: "settlement_account_number",
      width: 150,
      render: (text: string, record: any) =>
        text || record.account_number || "N/A",
    },
    {
      title: "Account Name",
      dataIndex: "settlement_account_name",
      key: "settlement_account_name",
      width: 150,
      render: (text: string, record: any) =>
        text || record.account_name_or_code || "N/A",
    },
    {
      title: "Subaccount Code",
      dataIndex: "paystack_subaccount_code",
      key: "paystack_subaccount_code",
      width: 150,
      render: (text: string, record: any) => (
        <Tag color="blue">{text || record.subaccount_code || "N/A"}</Tag>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date: string) => moment(date).format("DD/MM/YYYY"),
    },
    {
      title: "Action",
      key: "action",
      width: 150,
      fixed: "right",
      render: (_: any, record: any) => (
        <Button
          type="primary"
          size="small"
          onClick={() => {
            setSelectedData(record);
            setOpenModal(true);
          }}
        >
          Approve/Reject
        </Button>
      ),
    },
  ];

  return (
    <>
      <Table
        dataSource={data}
        columns={columns as any}
        pagination={false}
        size="small"
        rowKey="id"
        scroll={{ x: 1300 }}
        locale={{
          emptyText: (
            <div className="py-5">
              <MdHourglassEmpty size={40} />
              <p>No pending subaccounts found</p>
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
          showTotal={(total: any) => `Total ${count ?? 0} Pending Approvals`}
          onChange={(page, pageSize) => {
            setPage(page);
            setTake(pageSize);
          }}
        />
      </div>
      <ActionModal
        open={openModal}
        close={() => setOpenModal(false)}
        data={selectedData}
      />
    </>
  );
}

export default DataTable;
