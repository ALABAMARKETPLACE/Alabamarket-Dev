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
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);

  const actionSubaccountMutation = useMutation({
    mutationFn: (data: { id: number; type: "approve" | "reject" }) => {
      const url = `${API.PAYSTACK_SUBACCOUNT_ACTION_BASE}${data.id}/${data.type}`;
      return POST(url, {});
    },
    onSuccess: (_, variables) => {
      notification.success({
        message: `Subaccount ${
          variables.type === "approve" ? "approved" : "rejected"
        } successfully`,
      });
      queryClient.invalidateQueries({
        queryKey: ["admin_paystack_subaccounts_pending"],
      });
      setLoadingId(null);
      setActionType(null);
    },
    onError: (err: any, variables) => {
      notification.error({
        message:
          err?.message ||
          `Failed to ${variables.type} subaccount`,
      });
      setLoadingId(null);
      setActionType(null);
    },
  });

  const handleAction = (storeId: number, type: "approve" | "reject") => {
    Modal.confirm({
      title: `${type === "approve" ? "Approve" : "Reject"} Subaccount`,
      content: `Are you sure you want to ${type} this Paystack subaccount?`,
      okText: type === "approve" ? "Approve" : "Reject",
      okType: type === "approve" ? "primary" : "danger",
      onOk: () => {
        setLoadingId(storeId);
        setActionType(type);
        actionSubaccountMutation.mutate({ id: storeId, type });
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
        <div className="flex gap-2">
          <Button
            type="primary"
            size="small"
            loading={loadingId === record.id && actionType === "approve"}
            onClick={() => handleAction(record.id, "approve")}
            disabled={loadingId === record.id && actionType !== "approve"}
          >
            Approve
          </Button>
          <Button
            danger
            size="small"
            loading={loadingId === record.id && actionType === "reject"}
            onClick={() => handleAction(record.id, "reject")}
            disabled={loadingId === record.id && actionType !== "reject"}
          >
            Reject
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
