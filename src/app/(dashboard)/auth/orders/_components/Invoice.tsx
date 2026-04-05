"use client";
import React, { useRef } from "react";
import { Modal, Button } from "antd";
import { FiPrinter } from "react-icons/fi";
import Image from "next/image";
import dayjs from "dayjs";
import Logo from "@/assets/images/new-logo.jpeg";

const COMPANY_NAME    = "Alaba Marketplace";
const COMPANY_SITE    = "alabamarketplace.ng";
const COMPANY_PHONE   = "+234 911 735 6897";
const COMPANY_ADDRESS = "Alaba International Market, Electronics Section B439, Lagos, Nigeria";
const COMPANY_EMAIL   = "customerservice@alabamarketplace.com";

export interface InvoiceItem {
  itemNo?:    string | number;
  name?:      string;
  size?:      string;
  price?:     number;
  quantity?:  number;
  total?:     number;
}

export interface InvoiceData {
  orderId?:       string | number;
  orderRef?:      string;
  packageNo?:     string | number;
  createdAt?:     string;
  payableAmount?: number;
  customerName?:  string;
  customerPhone?: string;
  address?: {
    full_address?: string;
    address?:      string;
    city?:         string;
    state?:        string;
    country?:      string;
  };
  items?: InvoiceItem[];
}

interface Props {
  open:    boolean;
  onClose: () => void;
  data:    InvoiceData;
}

// ── Fake barcode ───────────────────────────────────────────────────────────────
function Barcode({ value, height = 48 }: { value: string; height?: number }) {
  const bars = Array.from(value.padEnd(52, "0").slice(0, 52)).map((c, i) => ({
    w: (c.charCodeAt(0) % 3) + 1,
    h: i % 7 === 0 ? height : i % 3 === 0 ? height * 0.75 : height * 0.55,
    gap: i % 5 === 0 ? 3 : 1,
  }));
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
      <div style={{ display: "flex", alignItems: "flex-end" }}>
        {bars.map((b, i) => (
          <div key={i} style={{ width: b.w, height: b.h, background: "#000", marginRight: b.gap }} />
        ))}
      </div>
      <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "0.1em", color: "#1a1a1a" }}>
        {value}
      </div>
    </div>
  );
}

// ── The printable invoice ──────────────────────────────────────────────────────
function InvoiceContent({ data }: { data: InvoiceData }) {
  const ref = String(data.orderId ?? data.orderRef ?? "—");
  const addr = data.address;
  const addressLine = [
    addr?.full_address ?? addr?.address,
    addr?.city,
    addr?.state,
    addr?.country,
  ].filter(Boolean).join(", ");

  const fmt = (n?: number) =>
    n != null ? n.toLocaleString("en-NG", { minimumFractionDigits: 2 }) : "—";

  const tdStyle: React.CSSProperties = {
    padding: "6px 8px",
    border: "1px solid #d1d5db",
    fontSize: 11,
    color: "#1a1a1a",
    verticalAlign: "top",
  };
  const thStyle: React.CSSProperties = {
    ...tdStyle,
    background: "#f3f4f6",
    fontWeight: 700,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  };

  return (
    <div
      style={{
        width: 680,
        background: "#fff",
        fontFamily: "'Poppins', 'Roboto', Arial, sans-serif",
        fontSize: 12,
        color: "#1a1a1a",
        padding: "28px 32px",
        boxSizing: "border-box",
      }}
    >
      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
        {/* Logo + brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 56, height: 56, borderRadius: 10, overflow: "hidden", position: "relative", flexShrink: 0 }}>
            <Image src={Logo} alt={COMPANY_NAME} fill style={{ objectFit: "cover" }} sizes="56px" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 20, color: "#FF5F15", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              {COMPANY_NAME}
            </div>
            <div style={{ fontSize: 10, color: "#6b7280", marginTop: 2 }}>{COMPANY_SITE}</div>
            <div style={{ fontSize: 10, color: "#6b7280" }}>{COMPANY_PHONE}</div>
            <div style={{ fontSize: 10, color: "#6b7280" }}>{COMPANY_ADDRESS}</div>
          </div>
        </div>

        {/* SALES INVOICE title + barcode */}
        <div style={{ textAlign: "right" }}>
          <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: "0.04em", marginBottom: 10, color: "#1a1a1a" }}>
            SALES INVOICE
          </div>
          <Barcode value={ref} height={52} />
        </div>
      </div>

      {/* ── DIVIDER ─────────────────────────────────────────────────── */}
      <hr style={{ border: "none", borderTop: "1.5px solid #1a1a1a", marginBottom: 16 }} />

      {/* ── ORDER META + CUSTOMER ───────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 32, marginBottom: 20 }}>
        {/* Left: order meta */}
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {[
            ["Order Date",      data.createdAt ? dayjs(data.createdAt).format("YYYY-MM-DD HH:mm:ss") : "—"],
            ["Order No.",       ref],
            ["Package No.",     String(data.packageNo ?? ref)],
            ["Payable Amount",  data.payableAmount != null ? `₦${fmt(data.payableAmount)}` : "—"],
          ].map(([label, value]) => (
            <div key={label} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
              <span style={{ fontSize: 11, color: "#6b7280", width: 110, flexShrink: 0 }}>{label}:</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: "#111827" }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Right: customer details */}
        <div style={{ textAlign: "right", maxWidth: 260 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Customer Details
          </div>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{data.customerName ?? "—"}</div>
          {data.customerPhone && (
            <div style={{ fontSize: 11, color: "#4b5563", marginTop: 2 }}>{data.customerPhone}</div>
          )}
          {addressLine && (
            <div style={{ fontSize: 11, color: "#4b5563", marginTop: 3, lineHeight: 1.55 }}>{addressLine}</div>
          )}
        </div>
      </div>

      {/* ── ORDER DETAILS TABLE ──────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 12, background: "#1a1a1a", color: "#fff", padding: "7px 8px", marginBottom: 0 }}>
          Order Details
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: 90 }}>Items No.</th>
              <th style={{ ...thStyle }}>Product Name</th>
              <th style={{ ...thStyle, width: 70, textAlign: "center" }}>Qty</th>
              <th style={{ ...thStyle, width: 100, textAlign: "right" }}>Item Price</th>
              <th style={{ ...thStyle, width: 120, textAlign: "right" }}>Total Amount Due<br />(Incl. Shipping Fees)</th>
            </tr>
          </thead>
          <tbody>
            {(data.items ?? []).length > 0 ? (
              data.items!.map((item, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={tdStyle}>{item.itemNo ?? i + 1}</td>
                  <td style={tdStyle}>{item.name ?? "—"}</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>{item.quantity ?? 1}</td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>₦{fmt(item.price)}</td>
                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600 }}>₦{fmt(item.total)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ ...tdStyle, textAlign: "center", color: "#9ca3af" }}>No items</td>
              </tr>
            )}
            {/* Total row */}
            {data.payableAmount != null && (
              <tr>
                <td colSpan={4} style={{ ...tdStyle, textAlign: "right", fontWeight: 700, background: "#f9fafb" }}>
                  Grand Total
                </td>
                <td style={{ ...tdStyle, textAlign: "right", fontWeight: 800, fontSize: 13, background: "#f9fafb" }}>
                  ₦{fmt(data.payableAmount)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── THANK YOU NOTE ──────────────────────────────────────────── */}
      <div style={{ border: "1px solid #d1d5db", borderRadius: 4, padding: "12px 14px", marginBottom: 24, fontSize: 11, color: "#374151", lineHeight: 1.7 }}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Dear {data.customerName ?? "Valued Customer"},</div>
        <p style={{ margin: 0 }}>
          Thank you for shopping with us on <strong>Alaba Marketplace</strong> — Nigeria&apos;s premier electronics
          and general merchandise marketplace. We are delighted to have you as a customer. Items in your
          order are fulfilled by verified sellers on our platform.
        </p>
        <p style={{ margin: "6px 0 0" }}>
          If you have any concerns about your order, please contact us at{" "}
          <strong>{COMPANY_EMAIL}</strong> or call <strong>{COMPANY_PHONE}</strong>.
          Thank you for shopping with us.
        </p>
      </div>

      {/* ── CUT HERE ────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <div style={{ flex: 1, borderTop: "1.5px dashed #9ca3af" }} />
        <span style={{ fontSize: 10, color: "#9ca3af", whiteSpace: "nowrap" }}>✂ Cut here in case of return</span>
        <div style={{ flex: 1, borderTop: "1.5px dashed #9ca3af" }} />
      </div>

      {/* ── RETURN SLIP ─────────────────────────────────────────────── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
          Return / Tracking Reference
        </div>
        <Barcode value={ref} height={40} />
      </div>

      <div style={{ display: "flex", gap: 60, marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, color: "#6b7280" }}>Retrieved by</div>
          <div style={{ borderBottom: "1px solid #9ca3af", width: 160, marginTop: 20 }} />
        </div>
        <div>
          <div style={{ fontSize: 11, color: "#6b7280" }}>Sign &amp; Date</div>
          <div style={{ borderBottom: "1px solid #9ca3af", width: 160, marginTop: 20 }} />
        </div>
      </div>

      {/* ── RETURN ORDER DETAILS TABLE ───────────────────────────────── */}
      <div>
        <div style={{ fontWeight: 700, fontSize: 12, background: "#1a1a1a", color: "#fff", padding: "7px 8px" }}>
          Order Details
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: 90 }}>Items No.</th>
              <th style={{ ...thStyle }}>Product Name</th>
              <th style={{ ...thStyle, width: 70, textAlign: "center" }}>Qty</th>
              <th style={{ ...thStyle, width: 100, textAlign: "right" }}>Item Price</th>
              <th style={{ ...thStyle, width: 120, textAlign: "right" }}>Total Amount Due<br />(Incl. Shipping)</th>
              <th style={{ ...thStyle, width: 70, textAlign: "center" }}>Please Tick</th>
            </tr>
          </thead>
          <tbody>
            {(data.items ?? []).length > 0 ? (
              data.items!.map((item, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={tdStyle}>{item.itemNo ?? i + 1}</td>
                  <td style={tdStyle}>{item.name ?? "—"}</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>{item.quantity ?? 1}</td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>₦{fmt(item.price)}</td>
                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600 }}>₦{fmt(item.total)}</td>
                  <td style={{ ...tdStyle, textAlign: "center" }}>☐</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ ...tdStyle, textAlign: "center", color: "#9ca3af" }}>No items</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <div style={{ marginTop: 24, textAlign: "center", fontSize: 10, color: "#9ca3af", borderTop: "1px solid #e5e7eb", paddingTop: 12 }}>
        {COMPANY_NAME} · {COMPANY_SITE} · {COMPANY_PHONE} · {COMPANY_ADDRESS}
      </div>
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────────
export default function InvoiceModal({ open, onClose, data }: Props) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const el = invoiceRef.current;
    if (!el) return;
    const win = window.open("", "_blank", "width=780,height=900");
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice – ${data.orderId ?? data.orderRef ?? ""}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #fff; font-family: 'Poppins', 'Roboto', Arial, sans-serif; }
    @media print {
      @page { margin: 10mm; size: A4; }
    }
  </style>
</head>
<body>
  ${el.innerHTML}
  <script>
    window.onload = function () {
      window.print();
      window.onafterprint = function () { window.close(); };
    };
  </script>
</body>
</html>`);
    win.document.close();
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FiPrinter size={16} />
          Sales Invoice Preview
        </span>
      }
      width={760}
      centered
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <Button onClick={onClose}>Close</Button>
          <Button
            type="primary"
            onClick={handlePrint}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <FiPrinter size={14} />
            Print Invoice
          </Button>
        </div>
      }
    >
      <div
        style={{
          background: "#f3f4f6",
          borderRadius: 8,
          padding: "16px 8px",
          overflowX: "auto",
          maxHeight: "72vh",
          overflowY: "auto",
        }}
      >
        <div ref={invoiceRef}>
          <InvoiceContent data={data} />
        </div>
      </div>
      <p style={{ textAlign: "center", color: "#9ca3af", fontSize: 12, marginTop: 10 }}>
        Recommended paper: A4
      </p>
    </Modal>
  );
}
