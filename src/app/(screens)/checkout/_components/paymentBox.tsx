"use client";
import React from "react";
import { IoCardOutline, IoLockClosedOutline, IoShieldCheckmarkOutline } from "react-icons/io5";
import { IoMdRadioButtonOn } from "react-icons/io";
import Visa from "../../../../assets/images/visa.png";
import Mster from "../../../../assets/images/mastercard.png";
import Paystack from "../../../../assets/images/paystack-logo.png";
import Image from "next/image";

function PaymentBox({ onContinue }: { onContinue?: () => void }) {
  return (
    <div>
      {/* Section label */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{
          background: "linear-gradient(135deg, #fff4ee 0%, #ffe8d6 100%)",
          border: "1px solid rgba(255,95,21,0.2)",
          padding: "6px 9px",
          borderRadius: 10,
          fontSize: 17,
          color: "#ff5f15",
          display: "flex",
          alignItems: "center",
        }}>
          <IoCardOutline />
        </div>
        <span style={{ fontWeight: 700, fontSize: 17, color: "#1a1a2e" }}>PAYMENT METHOD</span>
      </div>
      <div style={{ height: 1, background: "#f0f0f0", marginBottom: 18 }} />

      {/* Payment option card */}
      <div style={{
        border: "2px solid #ff5f15",
        borderRadius: 14,
        padding: "16px 20px",
        background: "linear-gradient(135deg, #fffaf7 0%, #fff 100%)",
        boxShadow: "0 4px 16px rgba(255, 95, 21, 0.1)",
        cursor: "pointer",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <IoMdRadioButtonOn size={22} color="#ff5f15" />

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#1a1a2e", marginBottom: 3 }}>
              Pay Online
            </div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>
              Secured by Paystack · Cards, Bank Transfer, USSD
            </div>
          </div>

          {/* Card logos */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <Image src={Visa} height={22} alt="Visa" style={{ objectFit: "contain" }} />
            <Image src={Mster} height={22} alt="Mastercard" style={{ objectFit: "contain" }} />
            <Image src={Paystack} height={22} alt="Paystack" style={{ objectFit: "contain" }} />
            <div style={{
              background: "#00C9A7",
              color: "#fff",
              padding: "3px 7px",
              borderRadius: 5,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.3px",
            }}>
              Verve
            </div>
          </div>
        </div>
      </div>

      {/* Security assurance */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        marginTop: 16,
        padding: "12px 0",
        borderTop: "1px solid #f3f4f6",
        flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#9ca3af" }}>
          <IoLockClosedOutline size={13} style={{ color: "#16a34a" }} />
          256-bit SSL Encryption
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#9ca3af" }}>
          <IoShieldCheckmarkOutline size={14} style={{ color: "#2563eb" }} />
          PCI DSS Compliant
        </div>
      </div>

      {onContinue && (
        <button
          className="step-continue-btn"
          onClick={() => onContinue()}
        >
          Continue to Review →
        </button>
      )}
    </div>
  );
}

export default PaymentBox;
