"use client";
import React, { useState } from "react";
import { Button, Table, Pagination, Tag } from "antd";
import { useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  const handleAction = (record: any) => {
    setSelectedRecord(record);
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
    setSelectedRecord(null);
  };

  const columns = [
    {
      title: "Store Name",
      dataIndex: "store_name",
      key: "store_name",
      width: 150,
      fixed: "left",
      render: (text: string, record: any) => (
        <span className="font-medium">
          {text || record.store?.store_name || "N/A"}
        </span>
      ),
    },
    {
      title: "Seller Name",
      dataIndex: "seller_name",
      key: "seller_name",
      width: 150,
      render: (text: string, record: any) =>
        text ||
        record.seller_name ||
        record.store?.seller_name ||
        record.store?.name ||
        record.store?.user?.name ||
        "N/A",
    },
    {
      title: "Bank Details",
      key: "bank_details",
      width: 250,
      render: (_: any, record: any) => (
        <div className="flex flex-col text-xs">
          <span className="font-semibold">
            {record.settlement_bank || record.bank_name}
          </span>
          <span>
            {record.settlement_account_number || record.account_number || "N/A"}
          </span>
          <span
            className="text-gray-500 truncate"
            title={
              record.settlement_account_name || record.account_name_or_code
            }
          >
            {record.settlement_account_name ||
              record.account_name_or_code ||
              "N/A"}
          </span>
        </div>
      ),
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
        <div className="flex gap-2">
          <Button
            type="primary"
            size="small"
            onClick={() => handleAction(record)}
          >
            Approve/Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Table
        dataSource={data}
        columns={columns as any}
        pagination={false}
        size="middle"
        rowKey="id"
        scroll={{ x: 1000 }}
        locale={{
          emptyText: (
            <div className="py-10 flex flex-col items-center justify-center text-gray-400">
              <MdHourglassEmpty size={40} className="mb-2" />
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
      {openModal && (
        <ActionModal open={openModal} close={handleClose} data={selectedRecord} />
      )}
    </>
  );
}

export default DataTable;
