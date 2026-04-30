"use client";
import React, { useState, useCallback } from "react";
import PageHeader from "@/app/(dashboard)/_components/pageHeader";
import Loading from "@/app/(dashboard)/_components/loading";
import ErrorDisplay from "@/app/(dashboard)/_components/error";
import { Tag, Button, Table, Input, Space, Tooltip, notification } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useQuery } from "@tanstack/react-query";
import { GET } from "@/util/apicall";
import API from "@/config/API";
import { useSession } from "next-auth/react";
import dayjs from "dayjs";
import {
  FiRefreshCw,
  FiSearch,
  FiX,
  FiAlertCircle,
  FiCheckCircle,
  FiUser,
  FiShoppingBag,
} from "react-icons/fi";
import { HiOutlineDocumentReport } from "react-icons/hi";

// ── Types ──────────────────────────────────────────────────────────────────────

interface SettlementEstimate {
  order_amount: number;
  seller_amount: number;
  company_amount: number;
  admin_percentage: number;
  seller_percentage: number;
  currency: string;
}

interface AuditRecord {
  id: string;
  order_id: string;
  status: string;
  is_guest_order: boolean;
  totalItems: number;
  total: number;
  grandTotal: number;
  deliveryCharge: number;
  discount: number;
  tax: number;
  createdAt: string;
  buyer: {
    type: string;
    id?: number;
    name: string;
    email: string;
    phone: string;
    image?: string;
    country_code?: string;
  };
  store: {
    id: string;
    name: string;
    store_name: string;
    email: string;
    phone: string;
    slug: string;
    subaccount_status: string | null;
    paystack_subaccount_code: string | null;
  };
  items: { id: string; name: string; quantity: number; price: number; totalPrice: number; image: string }[];
  audit: {
    category: "manual_seller_payout" | "legacy_review_required" | string;
    reason: string;
    requires_manual_payout: boolean;
    requires_review: boolean;
    settlement_estimate: SettlementEstimate;
    store_link: { has_store_assignment: boolean; has_store_record: boolean; has_active_subaccount: boolean };
  };
  payment: {
    id: string;
    paymentType: string;
    status: string;
    ref: string | null;
    amount: number;
    currency: string | null;
    collection_mode: string;
    paystack_account_used: string | null;
    requires_manual_settlement: boolean;
    manual_settlement_reason: string | null;
  };
}

interface Summary {
  total_records: number;
  total_order_amount: number;
  total_company_amount: number;
  total_manual_payout_amount: number;
  manual_payout_count: number;
  unassigned_company_collection_count: number;
  legacy_review_count: number;
}

interface CustomSession {
  token?: string;
  [key: string]: unknown;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  "₦" + (n ?? 0).toLocaleString("en-NG", { minimumFractionDigits: 2 });

const ORDER_STATUS_COLORS: Record<string, string> = {
  processing: "blue",
  pending: "orange",
  completed: "green",
  failed: "red",
  cancelled: "default",
};

const CATEGORY_META: Record<string, { color: string; label: string }> = {
  manual_seller_payout:   { color: "volcano", label: "Manual Payout" },
  legacy_review_required: { color: "purple",  label: "Legacy Review" },
};

// ── Summary Cards ─────────────────────────────────────────────────────────────

function SummaryCards({ s }: { s: Summary }) {
  const cards = [
    { label: "Total Records",       value: String(s.total_records),                             color: "#3b82f6" },
    { label: "Order Amount",        value: fmt(s.total_order_amount),                           color: "#10b981" },
    { label: "Company Collected",   value: fmt(s.total_company_amount),                         color: "#f59e0b" },
    { label: "Manual Payout Due",   value: fmt(s.total_manual_payout_amount),                   color: "#ef4444" },
    { label: "Payout Count",        value: `${s.manual_payout_count} orders`,                   color: "#8b5cf6" },
    { label: "Legacy Review",       value: `${s.legacy_review_count} orders`,                   color: "#6b7280" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
      {cards.map((c) => (
        <div key={c.label} style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderTop: `3px solid ${c.color}` }}>
          <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 6 }}>{c.label}</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#1a1a2e" }}>{c.value}</div>
        </div>
      ))}
    </div>
  );
}

// ── Table columns ──────────────────────────────────────────────────────────────

const columns: ColumnsType<AuditRecord> = [
  {
    title: "Order",
    key: "order",
    width: 160,
    render: (_, r) => (
      <div>
        <div style={{ fontFamily: "monospace", fontSize: 12, color: "#374151", fontWeight: 600 }}>{r.order_id}</div>
        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{dayjs(r.createdAt).format("DD MMM YYYY HH:mm")}</div>
        <Tag color={ORDER_STATUS_COLORS[r.status] ?? "default"} style={{ marginTop: 4, fontSize: 10, textTransform: "capitalize" }}>
          {r.status}
        </Tag>
      </div>
    ),
  },
  {
    title: "Buyer",
    key: "buyer",
    width: 170,
    render: (_, r) => (
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <FiUser size={14} color="#9ca3af" style={{ marginTop: 2, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#1f2937" }}>{r.buyer.name}</div>
          <div style={{ fontSize: 11, color: "#6b7280" }}>{r.buyer.email}</div>
          {r.is_guest_order && <Tag color="default" style={{ fontSize: 10, marginTop: 3 }}>Guest</Tag>}
        </div>
      </div>
    ),
  },
  {
    title: "Store",
    key: "store",
    width: 160,
    render: (_, r) => (
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <FiShoppingBag size={14} color="#9ca3af" style={{ marginTop: 2, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: "#1f2937" }}>{r.store.store_name}</div>
          <div style={{ fontSize: 11, color: "#6b7280" }}>{r.store.name}</div>
          {r.audit.store_link.has_active_subaccount
            ? <Tag color="green"  style={{ fontSize: 10, marginTop: 3 }}>Subaccount ✓</Tag>
            : <Tag color="red"    style={{ fontSize: 10, marginTop: 3 }}>No Subaccount</Tag>}
        </div>
      </div>
    ),
  },
  {
    title: "Amount",
    key: "amount",
    width: 150,
    render: (_, r) => {
      const est = r.audit.settlement_estimate;
      return (
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{fmt(r.grandTotal)}</div>
          <div style={{ fontSize: 11, color: "#10b981", marginTop: 2 }}>Seller: {fmt(est.seller_amount)}</div>
          <div style={{ fontSize: 11, color: "#f59e0b" }}>Platform: {fmt(est.company_amount)}</div>
        </div>
      );
    },
  },
  {
    title: "Audit",
    key: "audit",
    width: 140,
    render: (_, r) => {
      const meta = CATEGORY_META[r.audit.category] ?? { color: "default", label: r.audit.category };
      return (
        <div>
          <Tag color={meta.color} style={{ fontSize: 11 }}>{meta.label}</Tag>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4, lineHeight: 1.4 }}>
            {r.audit.requires_manual_payout && (
              <span style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: 3 }}>
                <FiAlertCircle size={10} /> Needs payout
              </span>
            )}
            {r.audit.requires_review && (
              <span style={{ color: "#8b5cf6", display: "flex", alignItems: "center", gap: 3 }}>
                <FiAlertCircle size={10} /> Needs review
              </span>
            )}
            {!r.audit.requires_manual_payout && !r.audit.requires_review && (
              <span style={{ color: "#10b981", display: "flex", alignItems: "center", gap: 3 }}>
                <FiCheckCircle size={10} /> OK
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    title: "Payment",
    key: "payment",
    width: 160,
    render: (_, r) => (
      <div>
        <div style={{ fontFamily: "monospace", fontSize: 11, color: "#374151" }}>{r.payment.ref ?? "—"}</div>
        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2, textTransform: "capitalize" }}>
          {r.payment.collection_mode?.replace(/_/g, " ")}
        </div>
        <Tag
          color={r.payment.status === "success" ? "green" : r.payment.status === "pending" ? "orange" : "red"}
          style={{ fontSize: 10, marginTop: 3, textTransform: "capitalize" }}
        >
          {r.payment.status}
        </Tag>
      </div>
    ),
  },
];

// ── Page ───────────────────────────────────────────────────────────────────────

function Page() {
  const { data: sessionData, status: authStatus } = useSession();
  const session = sessionData as CustomSession | null;

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]           = useState("");

  const applySearch = useCallback(() => setSearch(searchInput.trim()), [searchInput]);
  const clearSearch = useCallback(() => { setSearchInput(""); setSearch(""); }, []);

  const { data: raw, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: [API.PAYSTACK_MANUAL_SETTLEMENT_AUDIT],
    queryFn: () => GET(API.PAYSTACK_MANUAL_SETTLEMENT_AUDIT, {}, null, { token: session?.token }),
    enabled: authStatus === "authenticated" && !!session?.token,
    retry: false,
  });

  const response = raw as { status: boolean; data?: { summary?: Summary; records?: AuditRecord[] } } | undefined;
  const summary  = response?.data?.summary;
  const allRows  = response?.data?.records ?? [];

  const rows = search
    ? allRows.filter(
        (r) =>
          r.order_id.includes(search) ||
          r.buyer.name.toLowerCase().includes(search.toLowerCase()) ||
          r.buyer.email.toLowerCase().includes(search.toLowerCase()) ||
          r.store.store_name.toLowerCase().includes(search.toLowerCase()) ||
          (r.payment.ref ?? "").includes(search),
      )
    : allRows;

  return (
    <>
      <PageHeader
        title="Settlement Audit"
        bredcume="Dashboard / Settlement Audit"
        icon={<HiOutlineDocumentReport />}
      >
        <Button onClick={() => refetch()} loading={isFetching && !isLoading} icon={<FiRefreshCw />}>
          Refresh
        </Button>
      </PageHeader>

      {isLoading ? (
        <Loading />
      ) : isError ? (
        <ErrorDisplay description={(error as Error)?.message} onRetry={() => refetch()} />
      ) : (
        <>
          {summary && <SummaryCards s={summary} />}

          {/* Search bar */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
            <Input
              prefix={<FiSearch size={13} color="#9ca3af" />}
              placeholder="Search order ID, buyer, store or payment ref…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onPressEnter={applySearch}
              style={{ maxWidth: 340 }}
              allowClear
            />
            <Space>
              <Button type="primary" icon={<FiSearch />} onClick={applySearch}>Search</Button>
              {search && (
                <Tooltip title="Clear search">
                  <Button icon={<FiX />} onClick={clearSearch}>Clear</Button>
                </Tooltip>
              )}
            </Space>
            <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: "auto" }}>
              {rows.length} of {allRows.length} records
            </span>
          </div>

          {/* Desktop Table */}
          <div className="hide-tablet">
            <Table
              columns={columns}
              dataSource={rows}
              rowKey={(r) => r.id}
              pagination={{ pageSize: 20, showSizeChanger: false, showTotal: (t) => `${t} records` }}
              loading={isFetching}
              scroll={{ x: 1000 }}
              locale={{
                emptyText: (
                  <div style={{ padding: "40px 0", color: "#9ca3af", textAlign: "center" }}>
                    No audit records found.
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
              rows.map((r) => {
                const est  = r.audit.settlement_estimate;
                const meta = CATEGORY_META[r.audit.category] ?? { color: "default", label: r.audit.category };
                return (
                  <div key={r.id} className="dashboard-tableMobileCard">
                    <div className="dashboard-tableMobileHeader">
                      <div className="dashboard-tableMobileTitle" style={{ flex: 1, minWidth: 0 }}>
                        <div className="title" style={{ fontFamily: "monospace", fontSize: 12 }}>{r.order_id}</div>
                        <div className="sub">{r.buyer.name} · {r.buyer.email}</div>
                        <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                          <Tag color={ORDER_STATUS_COLORS[r.status] ?? "default"} style={{ textTransform: "capitalize", fontSize: 10 }}>{r.status}</Tag>
                          <Tag color={meta.color} style={{ fontSize: 10 }}>{meta.label}</Tag>
                          {r.is_guest_order && <Tag color="default" style={{ fontSize: 10 }}>Guest</Tag>}
                        </div>
                      </div>
                    </div>
                    <div className="dashboard-tableMobileBody">
                      <div className="dashboard-tableMobileRow">
                        <span className="label">Store</span>
                        <span className="value">{r.store.store_name}</span>
                      </div>
                      <div className="dashboard-tableMobileRow">
                        <span className="label">Order Total</span>
                        <span className="value" style={{ fontWeight: 700 }}>{fmt(r.grandTotal)}</span>
                      </div>
                      <div className="dashboard-tableMobileRow">
                        <span className="label">Seller Gets</span>
                        <span className="value" style={{ color: "#10b981" }}>{fmt(est.seller_amount)}</span>
                      </div>
                      <div className="dashboard-tableMobileRow">
                        <span className="label">Platform Gets</span>
                        <span className="value" style={{ color: "#f59e0b" }}>{fmt(est.company_amount)}</span>
                      </div>
                      <div className="dashboard-tableMobileRow">
                        <span className="label">Payment Ref</span>
                        <span className="value" style={{ fontFamily: "monospace", fontSize: 11 }}>{r.payment.ref ?? "—"}</span>
                      </div>
                      <div className="dashboard-tableMobileRow">
                        <span className="label">Date</span>
                        <span className="value">{dayjs(r.createdAt).format("DD MMM YYYY HH:mm")}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
    </>
  );
}

export default Page;
