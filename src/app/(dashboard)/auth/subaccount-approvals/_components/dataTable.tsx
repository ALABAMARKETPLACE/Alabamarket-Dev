"use client";
import React, { useState } from "react";
import { Button, Table, Pagination, Tag, notification, Modal } from "antd";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PUT } from "@/util/apicall";
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
      return PUT(url, {});
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
      width: 150,
      fixed: "left",
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: "Seller Name",
      dataIndex: "seller_name",
      key: "seller_name",
      width: 150,
    },
    {
      title: "Bank Details",
      key: "bank_details",
      width: 250,
      render: (_: any, record: any) => (
        <div className="flex flex-col text-xs">
          <span className="font-semibold">{record.settlement_bank}</span>
          <span>
            {record.settlement_account_number || record.account_number || "N/A"}
          </span>
          <span className="text-gray-500 truncate" title={record.settlement_account_name || record.account_name_or_code}>
            {record.settlement_account_name || record.account_name_or_code || "N/A"}
          </span>
        </div>
      ),
    },
    {
      title: "Subaccount Code",
      dataIndex: "paystack_subaccount_code",
      key: "paystack_subaccount_code",
      width: 150,
      render: (text: string) => <Tag color="blue">{text}</Tag>,
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
      width: 180,
      fixed: "right",
      render: (_: any, record: any) => (
        <div className="flex gap-2">
          <Button
            type="primary"
            size="small"
            loading={loadingId === record.id && actionType === "approve"}
            onClick={() => handleAction(record.id, "approve")}
            disabled={loadingId !== null && loadingId !== record.id}
          >
            Approve
          </Button>
          <Button
            danger
            size="small"
            loading={loadingId === record.id && actionType === "reject"}
            onClick={() => handleAction(record.id, "reject")}
            disabled={loadingId !== null && loadingId !== record.id}
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
    </>
  );
}

export default DataTable;
