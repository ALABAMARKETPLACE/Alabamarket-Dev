"use client";
import React, { useState, useEffect, useCallback } from "react";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import Loading from "@/app/(dashboard)/_components/loading";
import ErrorDisplay from "@/app/(dashboard)/_components/error";
import { Tag, Button, Table, Input, InputNumber, Space, Tooltip, notification } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API from "@/config/API";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import {
  FiRefreshCw,
  FiSearch,
  FiChevronRight,
  FiDollarSign,
  FiX,
} from "react-icons/fi";
import { HiOutlineDocumentReport } from "react-icons/hi";

interface AuditRecord {
  id?: number | string;
  reference?: string;
  amount?: number;
  buyerEmail?: string;
  storeId?: number | string;
  storeName?: string;
  status?: string;
  channel?: string;
  currency?: string;
  paidAt?: string;
  createdAt?: string;
  metadata?: Record<string, unknown>;
}

interface PaginationMeta {
  itemCount?: number;
  totalCount?: number;
  total?: number;
  totalPages?: number;
  pageCount?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  page?: number;
  take?: number;
}

interface AuditResponse {
  statusCode?: number;
  status: boolean;
  message?: string;
  data?: {
    rows?: AuditRecord[];
    meta?: PaginationMeta;
  } | AuditRecord[];
  meta?: PaginationMeta;
}

interface CustomSession {
  user?: { type?: string; [key: string]: unknown };
  role?: string;
  type?: string;
  token?: string;
  [key: string]: unknown;
}

const PAGE_SIZE = 20;

const STATUS_COLORS: Record<string, string> = {
  success: "green",
  failed: "red",
  pending: "orange",
  abandoned: "default",
  reversed: "volcano",
};

const columns: ColumnsType<AuditRecord> = [
  {
    title: "Reference",
    dataIndex: "reference",
    key: "reference",
    width: 180,
    render: (val) => <span className="table__code">{val ?? "-"}</span>,
  },
  {
    title: "Buyer Email",
    dataIndex: "buyerEmail",
    key: "buyerEmail",
    width: 200,
    render: (val) => (
      <span style={{ fontSize: 13, color: "#4a5568" }}>{val ?? "-"}</span>
    ),
  },
  {
    title: "Amount",
    dataIndex: "amount",
    key: "amount",
    width: 140,
    render: (val) => (
      <span className="table__amount">
        ₦{((val ?? 0) / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
      </span>
    ),
  },
  {
    title: "Store",
    key: "store",
    width: 160,
    render: (_, row) => (
      <div>
        <div style={{ fontWeight: 500, fontSize: 13 }}>{row.storeName ?? "-"}</div>
        {row.storeId && (
          <div style={{ fontSize: 11, color: "#718096" }}>ID: {row.storeId}</div>
        )}
      </div>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    width: 110,
    render: (val) => (
      <Tag
        color={STATUS_COLORS[val ?? ""] ?? "default"}
        style={{ textTransform: "capitalize" }}
      >
        {val ?? "-"}
      </Tag>
    ),
  },
  {
    title: "Channel",
    dataIndex: "channel",
    key: "channel",
    width: 100,
    render: (val) => (
      <span style={{ fontSize: 12, color: "#718096", textTransform: "capitalize" }}>
        {val ?? "-"}
      </span>
    ),
  },
  {
    title: "Date",
    key: "date",
    width: 150,
    render: (_, row) => {
      const d = row.paidAt ?? row.createdAt;
      return (
        <span className="table__date">
          {d ? dayjs(d).format("DD MMM YYYY HH:mm") : "-"}
        </span>
      );
    },
  },
];

function Page() {
  const { data: sessionData, status: authStatus } = useSession();
  const session = sessionData as CustomSession | null;
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [referenceInput, setReferenceInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [storeIdInput, setStoreIdInput] = useState<number | null>(null);

  // Applied filters (only committed on search)
  const [reference, setReference] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [storeId, setStoreId] = useState<number | null>(null);

  const applyFilters = useCallback(() => {
    setReference(referenceInput.trim());
    setBuyerEmail(emailInput.trim());
    setStoreId(storeIdInput ?? null);
    setPage(1);
  }, [referenceInput, emailInput, storeIdInput]);

  const clearFilters = useCallback(() => {
    setReferenceInput("");
    setEmailInput("");
    setStoreIdInput(null);
    setReference("");
    setBuyerEmail("");
    setStoreId(null);
    setPage(1);
  }, []);

  const hasActiveFilters = reference || buyerEmail || storeId;

  const queryParams: Record<string, unknown> = { page, take: PAGE_SIZE };
  if (reference) queryParams.reference = reference;
  if (buyerEmail) queryParams.buyerEmail = buyerEmail;
  if (storeId) queryParams.storeId = storeId;

  const queryKey = [
    API.PAYSTACK_MANUAL_SETTLEMENT_AUDIT,
    page,
    reference,
    buyerEmail,
    storeId,
  ];

  const { data: raw, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      console.log("[ManualSettlementAudit] Fetching:", queryParams);
      const res = await GET(
        API.PAYSTACK_MANUAL_SETTLEMENT_AUDIT,
        queryParams,
        null,
        { token: session?.token },
      );
      console.log("[ManualSettlementAudit] Response:", res);
      return res;
    },
    enabled: authStatus === "authenticated" && !!session?.token,
    retry: false,
  });

  useEffect(() => {
    if (isError && error) {
      const msg = (error as Error)?.message ?? "Failed to load audit records.";
      console.error("[ManualSettlementAudit] Error:", msg);
      notification.error({
        message: "Failed to load audit records",
        description: msg,
        duration: 6,
      });
    }
  }, [isError, error]);

  const response = raw as AuditResponse | undefined;
  const dataBlock = response?.data;
  const rows: AuditRecord[] = Array.isArray(dataBlock)
    ? dataBlock
    : Array.isArray((dataBlock as any)?.rows)
    ? (dataBlock as any).rows
    : [];

  const metaBlock: PaginationMeta =
    (dataBlock as any)?.meta ?? response?.meta ?? {};

  const totalCount =
    metaBlock.itemCount ??
    metaBlock.totalCount ??
    metaBlock.total ??
    (metaBlock.totalPages ?? metaBlock.pageCount ?? 1) * PAGE_SIZE;

  return (
    <>
      <PageHeader
        title="Settlement Audit"
        bredcume="Dashboard / Settlement Audit"
        icon={<HiOutlineDocumentReport />}
      >
        <Button
          onClick={() => refetch()}
          loading={isFetching && !isLoading}
          icon={<FiRefreshCw />}
        >
          Refresh
        </Button>
      </PageHeader>

      {/* Filter bar */}
      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "flex-end",
          marginBottom: 20,
          padding: "14px 16px",
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 11, color: "#718096", fontWeight: 500 }}>Reference</span>
          <Input
            prefix={<FiSearch size={13} color="#9ca3af" />}
            placeholder="PSK_REF_123"
            value={referenceInput}
            onChange={(e) => setReferenceInput(e.target.value)}
            onPressEnter={applyFilters}
            style={{ width: 190 }}
            allowClear
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 11, color: "#718096", fontWeight: 500 }}>Buyer Email</span>
          <Input
            prefix={<FiSearch size={13} color="#9ca3af" />}
            placeholder="buyer@example.com"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            onPressEnter={applyFilters}
            style={{ width: 210 }}
            allowClear
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 11, color: "#718096", fontWeight: 500 }}>Store ID</span>
          <InputNumber
            placeholder="e.g. 22"
            value={storeIdInput}
            onChange={(v) => setStoreIdInput(v)}
            onPressEnter={applyFilters}
            style={{ width: 120 }}
            min={1}
          />
        </div>

        <Space style={{ marginTop: 18 }}>
          <Button type="primary" icon={<FiSearch />} onClick={applyFilters}>
            Search
          </Button>
          {hasActiveFilters && (
            <Tooltip title="Clear all filters">
              <Button icon={<FiX />} onClick={clearFilters}>
                Clear
              </Button>
            </Tooltip>
          )}
        </Space>
      </div>

      {isLoading ? (
        <Loading />
      ) : isError ? (
        <ErrorDisplay
          description={(error as Error)?.message}
          onRetry={() => refetch()}
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hide-tablet" style={{ marginBottom: 24 }}>
            <Table
              columns={columns}
              dataSource={rows}
              rowKey={(r) => String(r.id ?? r.reference ?? Math.random())}
              pagination={{
                pageSize: PAGE_SIZE,
                current: page,
                total: totalCount,
                showSizeChanger: false,
                showTotal: (total) => `${total} records`,
                onChange: (p) => setPage(p),
              }}
              loading={isFetching}
              scroll={{ x: 1050 }}
              locale={{
                emptyText: (
                  <div className="table__empty-state">
                    <FiDollarSign className="table__empty-icon" />
                    <p className="table__empty-text">No audit records found.</p>
                  </div>
                ),
              }}
            />
          </div>

          {/* Mobile Cards */}
          <div className="dashboard-tableMobile">
            {rows.length === 0 ? (
              <div className="dashboard-tableMobileEmpty">No audit records found.</div>
            ) : (
              rows.map((r, i) => (
                <div
                  key={String(r.id ?? r.reference ?? i)}
                  className="dashboard-tableMobileCard"
                >
                  <div className="dashboard-tableMobileHeader">
                    <div className="dashboard-tableMobileImage">
                      <FiDollarSign
                        size={22}
                        color="#718096"
                        style={{ margin: "auto", display: "block", marginTop: 12 }}
                      />
                    </div>
                    <div className="dashboard-tableMobileTitle" style={{ flex: 1, minWidth: 0 }}>
                      <div className="title">{r.reference ?? "-"}</div>
                      <div className="sub">{r.buyerEmail}</div>
                      <div style={{ marginTop: 6 }}>
                        <Tag
                          color={STATUS_COLORS[r.status ?? ""] ?? "default"}
                          style={{ textTransform: "capitalize", fontSize: 11 }}
                        >
                          {r.status ?? "-"}
                        </Tag>
                      </div>
                    </div>
                    <FiChevronRight size={16} color="#9ca3af" style={{ flexShrink: 0 }} />
                  </div>
                  <div className="dashboard-tableMobileBody">
                    <div className="dashboard-tableMobileRow">
                      <span className="label">Amount</span>
                      <span className="value table__amount">
                        ₦{((r.amount ?? 0) / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="dashboard-tableMobileRow">
                      <span className="label">Store</span>
                      <span className="value">{r.storeName ?? r.storeId ?? "-"}</span>
                    </div>
                    <div className="dashboard-tableMobileRow">
                      <span className="label">Channel</span>
                      <span className="value" style={{ textTransform: "capitalize" }}>
                        {r.channel ?? "-"}
                      </span>
                    </div>
                    <div className="dashboard-tableMobileRow">
                      <span className="label">Date</span>
                      <span className="value table__date">
                        {(r.paidAt ?? r.createdAt)
                          ? dayjs(r.paidAt ?? r.createdAt).format("DD MMM YYYY")
                          : "-"}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}

            {totalCount > PAGE_SIZE && (
              <div style={{ display: "flex", justifyContent: "center", gap: 12, padding: "16px 0" }}>
                <Button
                  size="small"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span style={{ fontSize: 13, color: "#6b7280", alignSelf: "center" }}>
                  Page {page} of {Math.ceil(totalCount / PAGE_SIZE)}
                </span>
                <Button
                  size="small"
                  disabled={page >= Math.ceil(totalCount / PAGE_SIZE)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

export default Page;
