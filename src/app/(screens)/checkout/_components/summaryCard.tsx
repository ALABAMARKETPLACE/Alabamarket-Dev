"use client";
import React from "react";
import { Alert, Spin, Tag } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { IoLockClosedOutline, IoShieldCheckmarkOutline, IoInformationCircleOutline, IoStorefrontOutline } from "react-icons/io5";
import { GoArrowRight } from "react-icons/go";
import { useSelector } from "react-redux";
import CheckoutItem from "./checkoutItem";
import { formatCurrency } from "@/utils/formatNumber";
import {
  calculateDiscountedDelivery,
  getPromoRemainingTime,
} from "@/config/promoConfig";

const antIcon = <LoadingOutlined style={{ fontSize: 20, color: "#fff" }} spin />;

const SummaryCard = (props: any) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ReduxSettings = useSelector((state: any) => state.Settings.Settings);
  const resolvedSettings = ReduxSettings;

  const getCurrencySymbol = () =>
    resolvedSettings?.currency === "NGN" ? "₦" : resolvedSettings?.currency || "₦";

  const deliveryDiscount = calculateDiscountedDelivery(
    props?.delivery_charge || 0,
    props?.total || 0,
  );

  const adjustedGrandTotal = deliveryDiscount.hasDiscount
    ? (props?.grand_total || 0) - deliveryDiscount.discountAmount
    : props?.grand_total || 0;

  // Group items by storeId
  const groupedByStore: Record<string, any[]> = {};
  (props?.Cart?.Checkout || []).forEach((item: any) => {
    const storeId = item.storeId || item.store_id || "unknown";
    if (!groupedByStore[storeId]) groupedByStore[storeId] = [];
    groupedByStore[storeId].push(item);
  });

  const getStoreName = (item: any) =>
    item.storeName || item.store_name || `Store #${item.storeId || item.store_id}`;

  const getAddressSummary = (addr: any) => {
    if (!addr) return null;
    const parts = [
      addr.full_name || addr.name,
      addr.address || addr.street,
      addr.city,
      addr.stateDetails?.name || addr.state,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const itemCount = props?.Cart?.Checkout?.length ?? 0;

  return (
    <div className="Cart-SummaryCard">

      {/* Shipping + payment summary bar */}
      {(props?.selectedAddress || props?.selectedPayment) && (
        <div style={{
          background: "#f8faff",
          border: "1px solid #e0eaff",
          borderRadius: 12,
          padding: "12px 16px",
          marginBottom: 20,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}>
          {props?.selectedAddress && (
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 14, marginTop: 1 }}>📍</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>
                  Delivering to
                </div>
                <div style={{ fontSize: 13, color: "#1a1a2e", fontWeight: 600 }}>
                  {getAddressSummary(props.selectedAddress)}
                </div>
              </div>
            </div>
          )}
          {props?.selectedPayment && (
            <div style={{ display: "flex", gap: 10, alignItems: "center", paddingTop: props?.selectedAddress ? 8 : 0, borderTop: props?.selectedAddress ? "1px solid #e0eaff" : "none" }}>
              <span style={{ fontSize: 14 }}>💳</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>
                  Payment
                </div>
                <div style={{ fontSize: 13, color: "#1a1a2e", fontWeight: 600 }}>{props.selectedPayment}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <div className="Cart-row" style={{ marginBottom: 4 }}>
        <div className="Cart-txt5">Order Review</div>
        <div style={{ flex: 1 }} />
        <div className="Cart-txt6">{itemCount} {itemCount === 1 ? "Item" : "Items"}</div>
      </div>
      <div className="Cart-line" />

      {/* Items grouped by store */}
      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 20 }}>
        {Object.entries(groupedByStore).map(([storeId, items]) => {
          const storeName = getStoreName(items[0]);
          const storeSubtotal = items.reduce(
            (sum, it) => sum + Number(it.totalPrice || 0), 0,
          );
          return (
            <div key={storeId}>
              {/* Store header */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
                paddingBottom: 8,
                borderBottom: "1px solid #f3f4f6",
              }}>
                <IoStorefrontOutline size={15} color="#6b7280" />
                <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>
                  {storeName}
                </span>
                <div style={{ flex: 1 }} />
                <span style={{ fontSize: 12, color: "#9ca3af" }}>
                  {getCurrencySymbol()} {formatCurrency(storeSubtotal)}
                </span>
              </div>
              {items.map((item: any, idx: number) => (
                <CheckoutItem key={idx} data={item} Settings={resolvedSettings} />
              ))}
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div style={{
        background: "#f9fafb",
        borderRadius: 12,
        padding: "16px",
        marginTop: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}>
        <div className="Cart-row">
          <div className="Cart-txt3">Products Subtotal</div>
          <div style={{ flex: 1 }} />
          <div className="Cart-txt4">{getCurrencySymbol()} {formatCurrency(props?.total)}</div>
        </div>

        {Number(props?.discount) > 0 && (
          <div className="Cart-row">
            <div className="Cart-txt3">Discount</div>
            <div style={{ flex: 1 }} />
            <div className="Cart-txt4" style={{ color: "#16a34a" }}>
              -{getCurrencySymbol()} {formatCurrency(props?.discount)}
            </div>
          </div>
        )}

        {/* Delivery with optional promo */}
        {deliveryDiscount.hasDiscount && deliveryDiscount.promo ? (
          <>
            <div style={{
              background: "#fff7ed",
              border: "1px dashed #fb923c",
              borderRadius: 10,
              padding: "10px 14px",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "#ea580c", fontWeight: 700 }}>
                  🎉 {deliveryDiscount.promo.name}
                </span>
                <Tag color="orange" style={{ margin: 0, fontSize: 11 }}>
                  {getPromoRemainingTime(deliveryDiscount.promo)}
                </Tag>
              </div>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>{deliveryDiscount.promo.description}</div>
            </div>
            <div className="Cart-row">
              <div className="Cart-txt3">Delivery</div>
              <div style={{ flex: 1 }} />
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 12, color: "#9ca3af", textDecoration: "line-through", marginRight: 6 }}>
                  {getCurrencySymbol()} {formatCurrency(deliveryDiscount.originalCharge)}
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#16a34a" }}>
                  {getCurrencySymbol()} {formatCurrency(deliveryDiscount.discountedCharge)}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="Cart-row">
            <div className="Cart-txt3">Delivery</div>
            <div style={{ flex: 1 }} />
            <div className="Cart-txt4">{getCurrencySymbol()} {formatCurrency(props?.delivery_charge)}</div>
          </div>
        )}

        <div style={{ borderTop: "2px dashed #e5e7eb", paddingTop: 12, marginTop: 4 }}>
          <div className="Cart-row">
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e" }}>Total</div>
            <div style={{ flex: 1 }} />
            <div className="Cart-txt7">{getCurrencySymbol()} {formatCurrency(adjustedGrandTotal)}</div>
          </div>
        </div>
      </div>

      {/* Error */}
      {props?.error && (
        <Alert
          type="error"
          style={{ marginTop: 16, borderRadius: 10 }}
          message={
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#dc2626", fontSize: 13 }}>
              <IoInformationCircleOutline size={16} />
              {props.error}
            </div>
          }
        />
      )}

      {/* Place Order CTA */}
      <button
        className="Cart-btn1"
        style={{ marginTop: 20, cursor: props?.loading ? "not-allowed" : "pointer" }}
        onClick={() => !props?.loading && props?.placeOrder()}
        disabled={props?.loading}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <IoLockClosedOutline size={16} style={{ opacity: 0.85 }} />
          {props?.loading ? "Processing..." : "PLACE ORDER"}
        </div>
        <div className="Cart-btn1Box">
          {props?.loading ? <Spin indicator={antIcon} /> : <GoArrowRight size={20} />}
        </div>
      </button>

      {/* Trust row */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        marginTop: 16,
        paddingTop: 14,
        borderTop: "1px solid #f3f4f6",
        flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#9ca3af" }}>
          <IoLockClosedOutline size={12} style={{ color: "#16a34a" }} />
          SSL Secured
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#9ca3af" }}>
          <IoShieldCheckmarkOutline size={13} style={{ color: "#2563eb" }} />
          Paystack Protected
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
