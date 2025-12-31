"use client";
import React, { useState } from "react";
import { Button, Table, Pagination, Tag, notification, Modal } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { POST } from "@/util/apicall";
import API from "@/config/API_ADMIN";
import moment from "moment";
import { MdHourglassEmpty } from "react-icons/md";

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
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const approveSubaccountMutation = useMutation({
    mutationFn: (data: any) => POST(API.PAYSTACK_SUBACCOUNT_APPROVE, data),
    onSuccess: () => {
      notification.success({ message: "Subaccount approved successfully" });
      queryClient.invalidateQueries({
        queryKey: ["admin_paystack_subaccounts_pending"],
      });
      setLoadingId(null);
    },
    onError: (err: any) => {
      notification.error({
        message: err?.message || "Failed to approve subaccount",
      });
      setLoadingId(null);
    },
  });

  const handleApprove = (storeId: number) => {
    Modal.confirm({
      title: "Approve Subaccount",
      content: "Are you sure you want to approve this Paystack subaccount?",
      onOk: () => {
        setLoadingId(storeId);
        approveSubaccountMutation.mutate({ store_id: storeId });
      },
    });
  };

  const columns = [
    {
      title: "Store Name",
      dataIndex: "store_name",
      key: "store_name",
    },
    {
      title: "Seller Name",
      dataIndex: "seller_name",
      key: "seller_name",
    },
    {
      title: "Bank Name",
      dataIndex: "settlement_bank",
      key: "settlement_bank",
    },
    {
      title: "Account Number",
      dataIndex: "settlement_account_number",
      key: "settlement_account_number",
      render: (text: string, record: any) =>
        text || record.account_number || "N/A",
    },
    {
      title: "Account Name",
      dataIndex: "settlement_account_name",
      key: "settlement_account_name",
      render: (text: string, record: any) =>
        text || record.account_name_or_code || "N/A",
    },
    {
      title: "Subaccount Code",
      dataIndex: "paystack_subaccount_code",
      key: "paystack_subaccount_code",
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => moment(date).format("DD/MM/YYYY"),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => (
        <Button
          type="primary"
          size="small"
          loading={loadingId === record.id}
          onClick={() => handleApprove(record.id)}
        >
          Approve
        </Button>
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
        rowKey="id"
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
    </>
  );
}

export default DataTable;
