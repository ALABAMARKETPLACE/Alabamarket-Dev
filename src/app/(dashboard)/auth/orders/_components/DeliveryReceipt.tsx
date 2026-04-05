"use client";
import React, { useRef } from "react";
import { Modal, Button } from "antd";
import { FiClipboard, FiPrinter } from "react-icons/fi";
import Image from "next/image";
import dayjs from "dayjs";
import Logo from "@/assets/images/new-logo.jpeg";

const COMPANY_NAME    = "Alaba Marketplace";
const COMPANY_PHONE   = "+234 911 735 6897";
const COMPANY_ADDRESS = "Alaba International Market, Electronics Section B439, Lagos, Nigeria";
const COMPANY_SITE    = "alabamarketplace.ng";

export interface ReceiptItem {
  itemNo?:       string | number;
  name?:         string;
  sku?:          string;
  quantity?:     number;
  price?:        number;
  shippingFee?:  number;
  total?:        number;
}

export interface DeliveryReceiptData {
  orderId?:        string | number;
  orderRef?:       string;
  createdAt?:      string;
  paymentMethod?:  string;
  payableAmount?:  number;
  customerName?:   string;
  customerPhone?:  string;
  storeName?:      string;
  address?: {
    full_address?: string;
    address?:      string;
    city?:         string;
    state?:        string;
    country?:      string;
  };
  items?: ReceiptItem[];
}

interface Props {
  open:    boolean;
  onClose: () => void;
  data:    DeliveryReceiptData;
}

// ── Barcode visual ────────────────────────────────────────────────────────────
function Barcode({ value, height = 44 }: { value: string; height?: number }) {
  const bars = Array.from(value.padEnd(50, "0").slice(0, 50)).map((c, i) => ({
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

// ── Single-item receipt page ───────────────────────────────────────────────────
function ItemReceipt({
  item,
  index,
  total,
  data,
  printedAt,
}: {
  item: ReceiptItem;
  index: number;
  total: number;
  data: DeliveryReceiptData;
  printedAt: string;
}) {
  const ref = String(data.orderId ?? data.orderRef ?? "—");
  const addr = data.address;
  const addrLines = [
    addr?.full_address ?? addr?.address,
    addr?.city,
    addr?.state,
    addr?.country,
  ].filter(Boolean);

  const fmt = (n?: number) =>
    n != null ? n.toLocaleString("en-NG", { minimumFractionDigits: 2 }) : "—";

  const border = "1px solid #ccc";
  const tdBase: React.CSSProperties = {
    border,
    padding: "5px 7px",
    fontSize: 11,
    verticalAlign: "top",
    color: "#1a1a1a",
  };
  const thBase: React.CSSProperties = {
    ...tdBase,
    background: "#f3f4f6",
    fontWeight: 700,
    fontSize: 10,
  };

  return (
    <div
      style={{
        width: 680,
        background: "#fff",
        fontFamily: "'Poppins', 'Roboto', Arial, sans-serif",
        fontSize: 11,
        color: "#1a1a1a",
        padding: "20px 24px",
        boxSizing: "border-box",
        pageBreakAfter: index < total - 1 ? "always" : "auto",
      }}
    >
      {/* ── TOP BAR ──────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontSize: 10, color: "#6b7280" }}>{printedAt} &nbsp;·&nbsp; Manage Orders</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 6, overflow: "hidden", position: "relative", flexShrink: 0 }}>
            <Image src={Logo} alt={COMPANY_NAME} fill style={{ objectFit: "cover" }} sizes="36px" />
          </div>
          <div style={{ fontWeight: 800, fontSize: 15, color: "#FF5F15", letterSpacing: "-0.02em" }}>
            {COMPANY_NAME}
          </div>
        </div>
      </div>

      {/* ── ORDER # + CUSTOMER NAME ──────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 24, marginBottom: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 600 }}>
          #: <span style={{ fontFamily: "monospace" }}>{ref}</span>
        </div>
        <div style={{ fontSize: 12 }}>
          Customer Name: <strong>{data.customerName ?? "—"}</strong>
        </div>
        {total > 1 && (
          <div style={{ marginLeft: "auto", fontSize: 10, color: "#6b7280" }}>
            Item {index + 1} of {total}
          </div>
        )}
      </div>

      {/* ── ADDRESS (left) + BARCODE/AMOUNT (right) ──────────────────── */}
      <div style={{ display: "flex", gap: 32, marginBottom: 14 }}>
        {/* Address block */}
        <div style={{ flex: "0 0 240px", fontSize: 11, lineHeight: 1.7, color: "#1a1a1a" }}>
          <div style={{ fontWeight: 700 }}>{data.customerName ?? "—"}</div>
          {data.customerPhone && <div>{data.customerPhone}</div>}
          {addrLines.map((l, i) => <div key={i}>{l}</div>)}
        </div>

        {/* TR# + barcode + amount + shift + signature */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 6 }}>TR#:</div>
          <Barcode value={ref} height={44} />
          <div style={{ marginTop: 8, fontSize: 11 }}>
            Amount:{" "}
            <strong>
              ₦{fmt(data.payableAmount)}{" "}
              <span style={{ fontWeight: 400 }}>{data.paymentMethod ?? "Online Payment"}</span>
            </strong>
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 48 }}>
            <div>
              <div style={{ fontSize: 10, color: "#6b7280" }}>Shift:</div>
              <div style={{ borderBottom: "1px solid #999", width: 100, marginTop: 14 }} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: "#6b7280" }}>Signature:</div>
              <div style={{ borderBottom: "1px solid #999", width: 140, marginTop: 14 }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── DELIVERY INSTRUCTIONS TABLE ──────────────────────────────── */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4 }}>
          Delivery Instructions &nbsp;
          <span style={{ fontFamily: "monospace", fontWeight: 400 }}>{ref}</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", border }}>
          <tbody>
            <tr>
              {/* Shipper */}
              <td style={{ ...tdBase, width: 160, verticalAlign: "top" }}>
                <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 3 }}>Shipper</div>
                <div style={{ fontWeight: 700 }}>{data.storeName ?? COMPANY_NAME}</div>
                <div style={{ fontSize: 10, color: "#4b5563", marginTop: 2 }}>{COMPANY_PHONE}</div>
              </td>
              {/* Order details + barcode */}
              <td style={{ ...tdBase, verticalAlign: "top" }}>
                <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 10, marginBottom: 2 }}>
                      Order #: <strong style={{ fontFamily: "monospace" }}>{ref}</strong>
                    </div>
                    <div style={{ fontSize: 10, marginBottom: 2 }}>
                      Ship D/T: <strong>{data.createdAt ? dayjs(data.createdAt).format("DD MMMM YYYY") : "—"}</strong>
                    </div>
                    <div style={{ marginTop: 6 }}>
                      <Barcode value={`*${ref}*`} height={36} />
                    </div>
                  </div>
                </div>
              </td>
              {/* MPDS ref */}
              <td style={{ ...tdBase, width: 140, textAlign: "right", verticalAlign: "top" }}>
                <div style={{ fontSize: 9, color: "#6b7280" }}>REF</div>
                <div style={{ fontFamily: "monospace", fontSize: 10, fontWeight: 700 }}>{ref}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── CUT HERE ─────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "16px 0" }}>
        <div style={{ flex: 1, borderTop: "1px dashed #9ca3af" }} />
        <span style={{ fontSize: 10, color: "#9ca3af", whiteSpace: "nowrap" }}>✂ Cut here in case of return</span>
        <div style={{ flex: 1, borderTop: "1px dashed #9ca3af" }} />
      </div>

      {/* ── PACKAGE DETAILS TABLE ────────────────────────────────────── */}
      <div>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>Package details:</div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ ...thBase }}>Item name</th>
              <th style={{ ...thBase, width: 60, textAlign: "center" }}>Quantity</th>
              <th style={{ ...thBase, width: 90, textAlign: "right" }}>Price of item</th>
              <th style={{ ...thBase, width: 90, textAlign: "right" }}>Shipping Fees</th>
              <th style={{ ...thBase, width: 110, textAlign: "right" }}>COD Item Total incl. Shipping fees</th>
              <th style={{ ...thBase, width: 80, textAlign: "center" }}>Item SKU / Seller</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdBase}>{item.name ?? "—"}</td>
              <td style={{ ...tdBase, textAlign: "center" }}>{item.quantity ?? 1}</td>
              <td style={{ ...tdBase, textAlign: "right" }}>₦{fmt(item.price)}</td>
              <td style={{ ...tdBase, textAlign: "right" }}>
                {item.shippingFee != null ? `₦${fmt(item.shippingFee)}` : "—"}
              </td>
              <td style={{ ...tdBase, textAlign: "right", fontWeight: 700 }}>₦{fmt(item.total)}</td>
              <td style={{ ...tdBase, textAlign: "center", fontFamily: "monospace", fontSize: 10 }}>
                {item.sku ?? "—"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <div style={{ marginTop: 16, textAlign: "center", fontSize: 9, color: "#9ca3af", borderTop: "1px solid #e5e7eb", paddingTop: 8 }}>
        {COMPANY_NAME} · {COMPANY_SITE} · {COMPANY_PHONE} · {COMPANY_ADDRESS}
      </div>
    </div>
  );
}

// ── All receipts stacked ───────────────────────────────────────────────────────
function AllReceipts({ data, printedAt }: { data: DeliveryReceiptData; printedAt: string }) {
  const items = data.items && data.items.length > 0 ? data.items : [{}];
  return (
    <>
      {items.map((item, i) => (
        <ItemReceipt
          key={i}
          item={item}
          index={i}
          total={items.length}
          data={data}
          printedAt={printedAt}
        />
      ))}
    </>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────────
export default function DeliveryReceiptModal({ open, onClose, data }: Props) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const printedAt  = dayjs().format("M/D/YY, h:mm A");

  const handlePrint = () => {
    const el = receiptRef.current;
    if (!el) return;
    const win = window.open("", "_blank", "width=780,height=900");
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Delivery Receipt – ${data.orderId ?? data.orderRef ?? ""}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #fff; font-family: 'Poppins', 'Roboto', Arial, sans-serif; }
    @media print {
      @page { margin: 8mm; size: A4; }
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

  const itemCount = data.items?.length ?? 1;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FiClipboard size={16} />
          Delivery Receipt Preview
          {itemCount > 1 && (
            <span style={{ fontSize: 11, color: "#6b7280", fontWeight: 400 }}>
              — {itemCount} items · {itemCount} page{itemCount > 1 ? "s" : ""}
            </span>
          )}
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
            Print Receipt{itemCount > 1 ? `s (${itemCount})` : ""}
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
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div ref={receiptRef}>
          <AllReceipts data={data} printedAt={printedAt} />
        </div>
      </div>
      <p style={{ textAlign: "center", color: "#9ca3af", fontSize: 12, marginTop: 10 }}>
        One page per item · Recommended paper: A4
      </p>
    </Modal>
  );
}
