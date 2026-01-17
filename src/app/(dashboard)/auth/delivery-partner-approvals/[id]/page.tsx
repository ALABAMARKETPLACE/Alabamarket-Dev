"use client";
import React, { useState } from "react";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import { Button, Card, notification, Modal, Input, Typography, Tag, Descriptions } from "antd";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GET, PUT } from "@/util/apicall";
import API from "@/config/API_ADMIN";
import Loading from "@/app/(dashboard)/_components/loading";
import Error from "@/app/(dashboard)/_components/error";
import moment from "moment";

function DeliveryPartnerDetails() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<{
    open: boolean;
    action?: "approved" | "rejected";
  }>({ open: false });
  const [remarks, setRemarks] = useState<string>("");

  const {
    data: company,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryFn: ({ signal }) => GET(API.DELIVERY_COMPANY_UPDATE_STATUS + params?.id, {}, signal),
    queryKey: ["delivery_company_details", params?.id],
    select: (data: any) => {
      if (data?.status) return data?.data;
      return null;
    },
  });

  const mutationApprove = useMutation({
    mutationFn: (payload: {
      status: "approved" | "rejected";
      remark?: string;
    }) =>
      PUT(`${API.DELIVERY_COMPANY_UPDATE_STATUS}${params?.id}/status`, {
        status: payload.status,
        remark: payload.remark,
      }),
    onSuccess: (res: any) => {
      notification.success({ message: res?.message || "Status updated successfully" });
      setModal({ open: false });
      setRemarks("");
      queryClient.invalidateQueries({ queryKey: ["delivery_company_details", params?.id] });
    },
    onError: (err: any) => {
      notification.error({
        message: err?.response?.data?.message || err?.message || "Failed to update status",
      });
    },
  });

  const handleConfirm = () => {
    if (!modal.action) return;
    mutationApprove.mutate({
      status: modal.action,
      remark: remarks || undefined,
    });
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "green";
      case "rejected":
        return "red";
      case "pending":
        return "orange";
      default:
        return "default";
    }
  };

  return (
    <>
      <PageHeader
        title={"Delivery Partner Details"}
        bredcume={"Dashboard / Delivery Partner Approvals / Details"}
      >
        <Button
          type="primary"
          ghost
          onClick={() => router.back()}
        >
          Back
        </Button>
        {company?.status === "pending" && (
            <>
                <Button type="primary" onClick={() => setModal({ open: true, action: "approved" })}>
                  Approve
                </Button>
                <Button danger onClick={() => setModal({ open: true, action: "rejected" })}>
                  Reject
                </Button>
            </>
        )}
      </PageHeader>
      {isLoading ? (
        <Loading />
      ) : isError ? (
        <Error description={error.message} />
      ) : (
        <div className="row gy-4">
            <div className="col-md-12">
                 <Card bordered={false}>
                    <div className="d-flex justify-content-between align-items-center">
                        <h4>{company?.business_name}</h4>
                        <Tag color={statusColor(company?.status)}>{company?.status?.toUpperCase()}</Tag>
                    </div>
                 </Card>
            </div>
          <div className="col-md-6">
            <Card title="Contact Information" bordered={false}>
              <Descriptions column={1}>
                <Descriptions.Item label="Contact Name">{company?.user?.name}</Descriptions.Item>
                <Descriptions.Item label="Email">{company?.user?.email}</Descriptions.Item>
                <Descriptions.Item label="Phone">{company?.phone}</Descriptions.Item>
                <Descriptions.Item label="Registered Date">{moment(company?.createdAt).format("DD/MM/YYYY")}</Descriptions.Item>
              </Descriptions>
            </Card>
          </div>
          <div className="col-md-6">
            <Card title="Business Details" bordered={false}>
              <Descriptions column={1}>
                <Descriptions.Item label="Business Name">{company?.business_name}</Descriptions.Item>
                <Descriptions.Item label="State">{company?.state}</Descriptions.Item>
                <Descriptions.Item label="City">{company?.city}</Descriptions.Item>
                <Descriptions.Item label="Address">{company?.address || "N/A"}</Descriptions.Item>
                <Descriptions.Item label="Description">{company?.description || "N/A"}</Descriptions.Item>
              </Descriptions>
            </Card>
          </div>
        </div>
      )}

      <Modal
        title={`${modal.action === "approved" ? "Approve" : "Reject"} Delivery Partner`}
        open={modal.open}
        onOk={handleConfirm}
        onCancel={() => {
            setModal({ open: false });
            setRemarks("");
        }}
        confirmLoading={mutationApprove.isPending}
      >
        <div style={{ marginBottom: 16 }}>
          <Typography.Text>
            Are you sure you want to {modal.action === "approved" ? "approve" : "reject"} this delivery partner?
          </Typography.Text>
        </div>
        <Input.TextArea
          placeholder="Add remarks (optional)"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          rows={4}
        />
      </Modal>
    </>
  );
}

export default DeliveryPartnerDetails;
