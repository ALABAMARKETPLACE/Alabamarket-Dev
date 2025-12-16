"use client";
import React, { useEffect, useState } from "react";
import { Button, Table, Pagination, Tag, Popconfirm, notification } from "antd";
import { MdHourglassEmpty } from "react-icons/md";
import { FiEye, FiEdit, FiTrash2 } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DELETE } from "@/util/apicall";
import API_ADMIN from "@/config/API_ADMIN";
import moment from "moment";
import "../styles.scss";

interface props {
  data: any[];
  count: number;
  setPage: Function;
  setTake: Function;
  pageSize: number;
  page: number;
}

function DataTable({ data, count, setPage, setTake, pageSize, page }: props) {
  const router = useRouter();
  const [Notifications, contextHolder] = notification.useNotification();
  const queryClient = useQueryClient();
  const [isMobile, setIsMobile] = useState(false);

  const mutationDelete = useMutation({
    mutationFn: (id: number) => {
      return DELETE(API_ADMIN.BOOST_REQUESTS + id);
    },
    onError: (error: any) => {
      Notifications["error"]({
        message: error.message || "Failed to delete boost request",
      });
    },
    onSuccess: () => {
      Notifications["success"]({
        message: "Boost request deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["boost_requests"] });
    },
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "orange";
      case "approved":
        return "green";
      case "rejected":
        return "red";
      case "expired":
        return "gray";
      default:
        return "default";
    }
  };

  const renderDesktopActions = (id: number, record: any) => (
    <div className="table-action">
      <Button
        type="text"
        size="small"
        title="View Details"
        onClick={() => router.push(`/auth/boost-request/${id}`)}
      >
        <FiEye size={18} />
      </Button>
      {record.status === "pending" && (
        <Button
          type="text"
          size="small"
          title="Edit"
          onClick={() => router.push(`/auth/boost-request/${id}/edit`)}
          style={{ color: "#1890ff" }}
        >
          <FiEdit size={18} />
        </Button>
      )}
      <Popconfirm
        title="Delete Boost Request"
        description="Are you sure you want to delete this boost request?"
        onConfirm={() => mutationDelete.mutate(id)}
        okText="Yes, Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <Button
          type="text"
          size="small"
          title="Delete"
          danger
          loading={mutationDelete.isPending && mutationDelete.variables === id}
        >
          <FiTrash2 size={18} />
        </Button>
      </Popconfirm>
    </div>
  );

  const columns = [
    {
      title: "Request ID",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "Seller Name",
      dataIndex: "seller",
      key: "seller",
      render: (seller: any) => seller?.name || "-",
    },
    {
      title: "Plan",
      dataIndex: "plan",
      key: "plan",
      render: (plan: any) => plan?.name || "-",
    },
    {
      title: "Products",
      dataIndex: "product_ids",
      key: "product_ids",
      width: 100,
      render: (ids: number[]) => ids?.length || 0,
    },
    {
      title: "Days",
      dataIndex: "days",
      key: "days",
      width: 80,
    },
    {
      title: "Total Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      width: 120,
      render: (amount: number) => `₦${Number(amount).toFixed(2)}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status?.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
      key: "start_date",
      width: 120,
      render: (date: string) =>
        date ? moment(date).format("DD/MM/YYYY") : "-",
    },
    {
      title: "End Date",
      dataIndex: "end_date",
      key: "end_date",
      width: 120,
      render: (date: string) =>
        date ? moment(date).format("DD/MM/YYYY") : "-",
    },
    {
      title: "Action",
      dataIndex: "id",
      key: "id",
      width: 150,
      fixed: "right" as const,
      render: (id: number, record: any) => renderDesktopActions(id, record),
    },
  ];

  const renderMobileCards = () => {
    if (!Array.isArray(data) || data.length === 0) {
      return (
        <div className="boostRequests-tableMobileEmpty">
          <MdHourglassEmpty size={40} />
          <p>No Boost Requests yet</p>
        </div>
      );
    }

    return data.map((record: any) => {
      const id = record?.id ?? record?._id;
      const productsCount = Array.isArray(record?.product_ids)
        ? record.product_ids.length
        : 0;
      const startDate = record?.start_date
        ? moment(record.start_date).format("DD MMM YYYY")
        : "-";
      const endDate = record?.end_date
        ? moment(record.end_date).format("DD MMM YYYY")
        : "-";
      const totalAmount =
        typeof record?.total_amount === "number"
          ? `₦${Number(record.total_amount).toFixed(2)}`
          : "--";

      return (
        <div className="boostRequests-tableMobileCard" key={id}>
          <div className="boostRequests-tableMobileHeader">
            <div className="boostRequests-cardTitleBlock">
              <div className="boostRequests-cardTitle">
                Request #{id ?? "--"}
              </div>
              <div className="boostRequests-cardSub">
                {record?.seller?.name ?? "Unknown seller"}
              </div>
            </div>
            <Tag color={getStatusColor(record?.status)}>
              {record?.status?.toUpperCase() ?? "UNKNOWN"}
            </Tag>
          </div>
          <div className="boostRequests-tableMobileBody">
            <div className="boostRequests-cardRow">
              <span className="label">Plan</span>
              <span className="value">{record?.plan?.name ?? "-"}</span>
            </div>
            <div className="boostRequests-cardRow">
              <span className="label">Products</span>
              <span className="value">{productsCount}</span>
            </div>
            <div className="boostRequests-cardRow">
              <span className="label">Days</span>
              <span className="value">{record?.days ?? "-"}</span>
            </div>
            <div className="boostRequests-cardRow">
              <span className="label">Amount</span>
              <span className="value">{totalAmount}</span>
            </div>
            <div className="boostRequests-cardRow">
              <span className="label">Period</span>
              <span className="value">
                {startDate} - {endDate}
              </span>
            </div>
          </div>
          <div className="boostRequests-tableMobileActions">
            <Button
              type="primary"
              ghost
              icon={<FiEye size={16} />}
              size="small"
              onClick={() => router.push(`/auth/boost-request/${id}`)}
            >
              View
            </Button>
            {record?.status === "pending" && (
              <Button
                icon={<FiEdit size={16} />}
                size="small"
                onClick={() => router.push(`/auth/boost-request/${id}/edit`)}
              >
                Edit
              </Button>
            )}
            <Popconfirm
              title="Delete Boost Request"
              description="Are you sure you want to delete this boost request?"
              onConfirm={() => mutationDelete.mutate(id)}
              okText="Delete"
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button
                danger
                size="small"
                icon={<FiTrash2 size={16} />}
                loading={
                  mutationDelete.isPending && mutationDelete.variables === id
                }
              >
                Delete
              </Button>
            </Popconfirm>
          </div>
        </div>
      );
    });
  };

  return (
    <>
      {contextHolder}
      {!isMobile ? (
        <Table
          dataSource={data}
          columns={columns}
          pagination={false}
          size="small"
          scroll={{ x: 1200 }}
          rowKey={(record: any) => record?.id ?? record?._id}
          className="boostRequests-tableDesktop"
          locale={{
            emptyText: (
              <div className="py-5">
                <MdHourglassEmpty size={40} />
                <p>No Boost Requests yet</p>
              </div>
            ),
          }}
        />
      ) : (
        <div className="boostRequests-tableMobile">{renderMobileCards()}</div>
      )}
      <div className="table-pagination">
        <Pagination
          showSizeChanger
          pageSize={pageSize}
          current={page}
          total={count ?? 0}
          showTotal={(total: number) => `Total ${total ?? 0} Boost Requests`}
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
