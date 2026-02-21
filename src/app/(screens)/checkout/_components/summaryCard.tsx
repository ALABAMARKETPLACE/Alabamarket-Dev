"use client";
import React from "react";
import { IoInformationCircleOutline } from "react-icons/io5";
import { GoArrowRight } from "react-icons/go";
import { useSelector } from "react-redux";
import { Alert, Spin, Tag } from "antd";
import CheckoutItem from "./checkoutItem";
import { LoadingOutlined } from "@ant-design/icons";
import { formatCurrency } from "@/utils/formatNumber";
import {
  calculateDiscountedDelivery,
  getPromoRemainingTime,
} from "@/config/promoConfig";

const antIcon = (
  <LoadingOutlined style={{ fontSize: 20, color: "#fff" }} spin />
);
const SummaryCard = (props: any) => {
  const Settings = useSelector((state: any) => state.Settings.Settings);

  const getCurrencySymbol = () => {
    if (Settings?.currency === "NGN") {
      return "₦";
    }
    return Settings?.currency || "₦";
  };

  // Calculate delivery discount
  const deliveryDiscount = calculateDiscountedDelivery(
    props?.delivery_charge || 0,
    props?.total || 0,
  );

  // Calculate adjusted grand total with promo
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

  // Optionally, get store names if available (assume item.storeName or item.store_name)
  const getStoreName = (item: any) =>
    item.storeName ||
    item.store_name ||
    `Store #${item.storeId || item.store_id}`;

  // Subtle reminder for address selection
  const addressSelected = !!props?.Cart?.address?.id;
  return (
    <div className="Cart-SummaryCard">
      {!addressSelected && (
        <Alert
          type="warning"
          message={
            <div style={{ display: "flex", alignItems: "center" }}>
              <IoInformationCircleOutline
                size={22}
                style={{ marginRight: 8 }}
              />
              <span>
                Please select and fill your delivery address to proceed with
                checkout.
              </span>
            </div>
          }
          showIcon
          style={{
            marginBottom: 12,
            background: "#fffbe6",
            border: "1px solid #ffe58f",
          }}
        />
      )}
      <div className="Cart-row">
        <div className="Cart-txt5">Checkout Summary</div>
        <div style={{ flex: 1 }} />
        <div className="Cart-txt6">{props?.Cart?.Checkout?.length} Item</div>
      </div>
      <div className="Cart-line" />
      {/* Grouped by seller/store */}
      {Object.entries(groupedByStore).map(([storeId, items], idx) => {
        const storeName = getStoreName(items[0]);
        const storeSubtotal = items.reduce(
          (sum, it) => sum + Number(it.totalPrice || 0),
          0,
        );
        return (
          <div
            key={storeId}
            style={{
              marginBottom: 18,
              borderBottom: "1px solid #eee",
              paddingBottom: 10,
            }}
          >
            <div
              style={{
                fontWeight: 600,
                fontSize: 15,
                marginBottom: 6,
                color: "#1a237e",
              }}
            >
              🏪 {storeName}
            </div>
            {items.map((item: any, index: number) => (
              <CheckoutItem key={index} data={item} Settings={Settings} />
            ))}
            <div className="Cart-row" style={{ marginTop: 6 }}>
              <div className="Cart-txt3">Subtotal for this seller</div>
              <div style={{ flex: 1 }} />
              <div className="Cart-txt4">
                {getCurrencySymbol()} {formatCurrency(storeSubtotal)}
              </div>
            </div>
          </div>
        );
      })}
      <br />
      <div className="Cart-row">
        <div className="Cart-txt3">Total Product Price</div>
        <div style={{ flex: 1 }} />
        <div className="Cart-txt4">
          {getCurrencySymbol()} {formatCurrency(props?.total)}
        </div>
      </div>
      <div style={{ margin: 15 }} />
      <div className="Cart-row">
        <div className="Cart-txt3">Discount</div>
        <div style={{ flex: 1 }} />
        <div className="Cart-txt4 text-success">
          -{getCurrencySymbol()} {formatCurrency(props?.discount)}
        </div>
      </div>
      <div style={{ margin: 15 }} />
      <div className="Cart-row">
        <div className="Cart-txt3">Tax</div>
        <div style={{ flex: 1 }} />
        <div className="Cart-txt4">{getCurrencySymbol()} 0.00</div>
      </div>
      <div style={{ margin: 15 }} />

      {/* Delivery Charges with Promo Support */}
      {deliveryDiscount.hasDiscount && deliveryDiscount.promo ? (
        <>
          <div
            style={{
              backgroundColor: "#fff3e0",
              padding: "8px 12px",
              borderRadius: "8px",
              marginBottom: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{ fontSize: "12px", color: "#e65100", fontWeight: 600 }}
              >
                🎉 {deliveryDiscount.promo.name}
              </span>
              <Tag color="orange" style={{ margin: 0 }}>
                {getPromoRemainingTime(deliveryDiscount.promo)}
              </Tag>
            </div>
            <div style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}>
              {deliveryDiscount.promo.description}
            </div>
          </div>
          <div className="Cart-row">
            <div className="Cart-txt3">Delivery Charges</div>
            <div style={{ flex: 1 }} />
            <div className="Cart-txt4">
              <span
                style={{
                  textDecoration: "line-through",
                  color: "#999",
                  marginRight: "8px",
                  fontSize: "13px",
                }}
              >
                {getCurrencySymbol()}{" "}
                {formatCurrency(deliveryDiscount.originalCharge)}
              </span>
              <span style={{ color: "#4caf50", fontWeight: 600 }}>
                {getCurrencySymbol()}{" "}
                {formatCurrency(deliveryDiscount.discountedCharge)}
              </span>
            </div>
          </div>
          <div
            style={{
              textAlign: "right",
              fontSize: "11px",
              color: "#4caf50",
              marginTop: "4px",
            }}
          >
            You save {getCurrencySymbol()}{" "}
            {formatCurrency(deliveryDiscount.discountAmount)}!
          </div>
        </>
      ) : (
        <div className="Cart-row">
          <div className="Cart-txt3">Delivery Charges</div>
          <div style={{ flex: 1 }} />
          <div className="Cart-txt4">
            {getCurrencySymbol()} {formatCurrency(props?.delivery_charge)}
          </div>
        </div>
      )}

      <div className="Cart-line2" />
      <div style={{ margin: 15 }} />
      <div className="Cart-row">
        <div className="Cart-txt3">Total :</div>
        <div style={{ flex: 1 }} />
        <div className="Cart-txt7">
          {getCurrencySymbol()} {formatCurrency(adjustedGrandTotal)}
        </div>
      </div>
      <div className="Cart-line2" />
      <div style={{ margin: 15 }} />
      {props?.error ? (
        <>
          <Alert
            type="error"
            message={
              <div className="Cart-error">
                <IoInformationCircleOutline size={30} /> &nbsp;{props?.error}
              </div>
            }
          />
          <div style={{ margin: 15 }} />
        </>
      ) : null}
      <div
        className="Cart-btn1"
        style={{
          cursor: addressSelected ? "pointer" : "not-allowed",
          opacity: addressSelected ? 1 : 0.6,
        }}
        onClick={() => {
          if (addressSelected) {
            props?.placeOrder();
          }
        }}
      >
        <div>PLACE ORDER </div>
        <div className="Cart-btn1Box">
          {props?.loading ? <Spin indicator={antIcon} /> : <GoArrowRight />}
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
