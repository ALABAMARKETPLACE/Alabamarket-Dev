"use client";
import React, { useRef } from "react";
import { Modal, Button } from "antd";
import { FiPrinter, FiMapPin, FiPhone, FiPackage } from "react-icons/fi";
import Image from "next/image";
import dayjs from "dayjs";
import Logo from "@/assets/images/new-logo.jpeg";

const SENDER_NAME    = "alabamarketplace.ng";
const SENDER_PHONE   = "+234 911 735 6897";
const SENDER_ADDRESS = "Alaba International Market, Lagos, Nigeria";

export interface ShippingLabelData {
  customerName?: string;
  customerPhone?: string;
  address?: {
    full_address?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    landmark?: string;
  };
  orderId?: string | number;
  orderRef?: string;
  createdAt?: string;
  items?: { name?: string; quantity?: number }[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  data: ShippingLabelData;
}

// ── Barcode visual ─────────────────────────────────────────────────────────────
function FakeBarcode({ value }: { value: string }) {
  const bars = Array.from(value.padEnd(44, "0").slice(0, 44)).map((c, i) => ({
    width: (c.charCodeAt(0) % 3) + 1,
    height: i % 7 === 0 ? 44 : i % 3 === 0 ? 34 : 26,
    gap: i % 5 === 0 ? 3 : 1,
  }));
  return (
    <div style={{ display: "flex", alignItems: "flex-end" }}>
      {bars.map((b, i) => (
        <div key={i} style={{ marginRight: b.gap, width: b.width, height: b.height, background: "#1a1a1a" }} />
      ))}
    </div>
  );
}

// ── Dashed divider ─────────────────────────────────────────────────────────────
function Dash() {
  return <div style={{ borderTop: "1.5px dashed #d1d5db", margin: "0 16px" }} />;
}

// ── The printable label ────────────────────────────────────────────────────────
function LabelContent({ data }: { data: ShippingLabelData }) {
  const ref    = String(data.orderId ?? data.orderRef ?? "—");
  const addr   = data.address;
  const lines  = [
    addr?.full_address ?? addr?.address,
    addr?.landmark,
    addr?.city,
    addr?.state,
    addr?.country,
  ].filter(Boolean).join(", ");

  return (
    <div
      style={{
        width: 384,
        background: "#ffffff",
        border: "1.5px solid #1a1a1a",
        borderRadius: 2,
        fontFamily: "'Poppins', 'Roboto', Arial, sans-serif",
        fontSize: 12,
        color: "#1a1a1a",
        overflow: "hidden",
      }}
    >
      {/* ── BRAND HEADER ──────────────────────────────────────────────── */}
      <div
        style={{
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1.5px solid #1a1a1a",
          background: "#fff",
        }}
      >
        {/* Logo + name (mirrors the site header) */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 8,
              overflow: "hidden",
              flexShrink: 0,
              position: "relative",
              border: "1px solid #f3f4f6",
            }}
          >
            <Image src={Logo} alt="Alaba Marketplace" fill style={{ objectFit: "cover" }} sizes="44px" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, letterSpacing: "-0.02em", color: "#FF5F15", lineHeight: 1.1 }}>
              Alaba Marketplace
            </div>
            <div style={{ fontSize: 10, color: "#6b7280", marginTop: 1 }}>
              Shop smarter. Sell faster.
            </div>
          </div>
        </div>

        {/* SHIPPING LABEL badge */}
        <div
          style={{
            background: "#FF5F15",
            color: "#fff",
            fontWeight: 700,
            fontSize: 10,
            padding: "4px 10px",
            borderRadius: 4,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Shipping Label
        </div>
      </div>

      {/* ── ORDER REF STRIP ───────────────────────────────────────────── */}
      <div
        style={{
          background: "#1a1a1a",
          color: "#fff",
          padding: "6px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 10, opacity: 0.55, textTransform: "uppercase", letterSpacing: "0.06em" }}>Order Ref</span>
        <span style={{ fontWeight: 700, fontFamily: "monospace", fontSize: 12, letterSpacing: "0.1em" }}>{ref}</span>
        <span style={{ fontSize: 10, opacity: 0.55 }}>
          {data.createdAt ? dayjs(data.createdAt).format("DD MMM YYYY") : dayjs().format("DD MMM YYYY")}
        </span>
      </div>

      {/* ── FROM ──────────────────────────────────────────────────────── */}
      <div style={{ padding: "12px 18px 14px" }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
          From
        </div>
        <div style={{ fontWeight: 700, fontSize: 13, color: "#FF5F15" }}>{SENDER_NAME}</div>
        <div style={{ fontSize: 11, color: "#4b5563", marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
          <FiPhone size={11} color="#6b7280" />
          {SENDER_PHONE}
        </div>
        <div style={{ fontSize: 11, color: "#4b5563", marginTop: 2, display: "flex", alignItems: "flex-start", gap: 4 }}>
          <FiMapPin size={11} color="#6b7280" style={{ marginTop: 1, flexShrink: 0 }} />
          {SENDER_ADDRESS}
        </div>
      </div>

      <Dash />

      {/* ── TO ────────────────────────────────────────────────────────── */}
      <div style={{ padding: "14px 18px 16px", background: "#fafafa" }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
          To (Recipient)
        </div>

        {/* Name — large and bold */}
        <div style={{ fontWeight: 800, fontSize: 22, color: "#111827", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 7 }}>
          {data.customerName ?? "—"}
        </div>

        {/* Phone */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 15, color: "#FF5F15", marginBottom: 9 }}>
          <FiPhone size={14} />
          {data.customerPhone ?? "—"}
        </div>

        {/* Address */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 12, color: "#374151", lineHeight: 1.6 }}>
          <FiMapPin size={13} style={{ flexShrink: 0, marginTop: 2, color: "#6b7280" }} />
          <span style={{ fontWeight: 500 }}>{lines || "—"}</span>
        </div>
      </div>

      <Dash />

      {/* ── ORDER ITEMS ───────────────────────────────────────────────── */}
      {data.items && data.items.length > 0 && (
        <div style={{ padding: "10px 18px 12px" }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7 }}>
            Items ({data.items.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {data.items.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 11,
                  color: "#374151",
                  paddingBottom: i < data.items!.length - 1 ? 4 : 0,
                  borderBottom: i < data.items!.length - 1 ? "1px dashed #e5e7eb" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: "#f3f4f6",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 9,
                      fontWeight: 700,
                      color: "#6b7280",
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ fontWeight: 500 }}>{item.name ?? "—"}</span>
                </div>
                <span style={{ fontWeight: 700, color: "#111827", flexShrink: 0, marginLeft: 8 }}>
                  ×{item.quantity ?? 1}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── PRINTED TIMESTAMP ─────────────────────────────────────────── */}
      <div style={{ padding: "8px 18px 10px", display: "flex", alignItems: "center", justifyContent: "flex-end", background: "#fafafa", borderTop: "1px dashed #d1d5db" }}>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 9, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>Printed</div>
          <div style={{ fontWeight: 500, fontSize: 10 }}>{dayjs().format("DD MMM YYYY, HH:mm")}</div>
        </div>
      </div>

      <Dash />

      {/* ── BARCODE ───────────────────────────────────────────────────── */}
      <div style={{ padding: "14px 18px 6px", display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
        <FakeBarcode value={ref} />
        <div style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "0.14em", color: "#374151" }}>{ref}</div>
      </div>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <div
        style={{
          padding: "8px 18px",
          borderTop: "1.5px solid #1a1a1a",
          background: "#f9fafb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <FiPackage size={10} color="#9ca3af" />
        <span style={{ fontSize: 10, color: "#6b7280", letterSpacing: "0.03em" }}>
          Handle with care &nbsp;·&nbsp; alabamarketplace.ng
        </span>
      </div>
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────────
export default function ShippingLabelModal({ open, onClose, data }: Props) {
  const labelRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const label = labelRef.current;
    if (!label) return;

    const win = window.open("", "_blank", "width=520,height=740");
    if (!win) return;

    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Shipping Label – ${data.orderId ?? data.orderRef ?? ""}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-family: 'Poppins', 'Roboto', Arial, sans-serif;
    }
    @media print {
      body { display: block; min-height: unset; }
      @page { margin: 6mm; size: 100mm 152mm; }
    }
  </style>
</head>
<body>
  ${label.innerHTML}
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
          Shipping Label Preview
        </span>
      }
      width={460}
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
            Print Label
          </Button>
        </div>
      }
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "20px 0 10px",
          background: "#f3f4f6",
          borderRadius: 8,
          overflowX: "auto",
        }}
      >
        <div ref={labelRef}>
          <LabelContent data={data} />
        </div>
      </div>
      <p style={{ textAlign: "center", color: "#9ca3af", fontSize: 12, marginTop: 10 }}>
        Recommended paper: A6 / 4×6 thermal label
      </p>
    </Modal>
  );
}
