"use client";
import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Button,
  Card,
  Descriptions,
  Input,
  Modal,
  Space,
  Typography,
  InputNumber,
  message,
} from "antd";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GET, POST, PUT } from "@/util/apicall";
import API_ADMIN from "@/config/API_ADMIN";
import Loading from "@/app/(dashboard)/_components/loading";
import Error from "@/app/(dashboard)/_components/error";

function Detail() {
  const params = useParams();
  const id = Number(params?.id);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<{ open: boolean; action?: "approved" | "rejected" }>({ open: false });
  const [remarks, setRemarks] = useState<string>("");
  const [priority, setPriority] = useState<number | undefined>(undefined);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["boost_request_admin_detail", id],
    queryFn: ({ signal }) => GET(`${API_ADMIN.BOOST_REQUESTS}${id}`, {}, signal),
    enabled: !!id,
  });

  const record = data?.data;

  const mutationApprove = useMutation({
    mutationFn: (payload: { id: number; status: "approved" | "rejected"; remarks?: string }) =>
      POST(API_ADMIN.BOOST_REQUEST_APPROVE, payload),
    onSuccess: () => {
      setModal({ open: false });
      setRemarks("");
      queryClient.invalidateQueries({ queryKey: ["boost_requests_admin"] });
      refetch();
    },
  });

  const mutationPriority = useMutation({
    mutationFn: (payload: { id: number; priority: number }) =>
      PUT(API_ADMIN.BOOST_REQUEST_PRIORITY, payload),
    onSuccess: async (res: any) => {
      message.success(res?.message ?? "Priority updated successfully");
      setPriority(undefined);
      await queryClient.invalidateQueries({ queryKey: ["boost_requests_admin"] });
      refetch();
    },
    onError: (err: any) => {
      const errorMessage =
        err?.response?.data?.message ?? err?.message ?? "Failed to update priority";
      message.error(errorMessage);
    },
  });

  return (
    <div>
      <PageHeader title={"Boost Request Details"} bredcume={"Dashboard / Boost Approvals / Details"}>
        <Space>
          <Button onClick={() => router.push("/auth/boost-approvals")}>Back</Button>
          <Button
            type="primary"
            disabled={record?.status !== "pending"}
            onClick={() => setModal({ open: true, action: "approved" })}
          >
            Approve
          </Button>
          <Button
            danger
            disabled={record?.status !== "pending"}
            onClick={() => setModal({ open: true, action: "rejected" })}
          >
            Reject
          </Button>
        </Space>
      </PageHeader>

      {isLoading ? (
        <Loading />
      ) : isError ? (
        <Error description={error?.message} />
      ) : (
        <>
          <Card title="Summary" style={{ marginBottom: 16 }}>
            <Descriptions
              bordered
              size="small"
              column={2}
              items={[
                { key: "id", label: "ID", children: record?.id },
                { key: "status", label: "Status", children: String(record?.status || "-").toUpperCase() },
                { key: "seller", label: "Seller", children: record?.seller?.name || "-" },
                { key: "plan", label: "Plan", children: record?.plan?.name || "-" },
                { key: "products", label: "Products", children: record?.product_ids?.length || 0 },
                { key: "days", label: "Days", children: record?.days },
                { key: "total", label: "Total", children: `$${Number(record?.total_amount || 0).toFixed(2)}` },
                { key: "requested", label: "Requested At", children: record?.requested_at || "-" },
                { key: "approved", label: "Approved At", children: record?.approved_at || "-" },
                { key: "start", label: "Start Date", children: record?.start_date || "-" },
                { key: "end", label: "End Date", children: record?.end_date || "-" },
              ]}
            />
          </Card>
        </>
      )}

      <Modal
        title={modal.action === "approved" ? "Approve Boost Request" : "Reject Boost Request"}
        open={modal.open}
        onCancel={() => {
          setModal({ open: false });
          setRemarks("");
        }}
        okText={modal.action === "approved" ? "Approve" : "Reject"}
        okButtonProps={{ loading: mutationApprove.isPending, danger: modal.action === "rejected" }}
        onOk={() => {
          if (!id || !modal.action) return;
          mutationApprove.mutate({ id, status: modal.action, remarks: remarks || undefined });
        }}
      >
        <Typography.Paragraph>
          This action will set the status to <b>{modal.action}</b>.
        </Typography.Paragraph>
        <Input.TextArea rows={4} placeholder="Remarks (optional)" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
      </Modal>
    </div>
  );
}

export default Detail;


