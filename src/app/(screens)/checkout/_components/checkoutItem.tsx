"use client";
import React from "react";
import { formatCurrency } from "@/utils/formatNumber";

const CheckoutItem = (props: any) => {
  const productPrice = Number(props?.data?.buyPrice);
  const quantity = props?.data?.quantity;
  const currencySymbol =
    props?.Settings?.currency === "NGN"
      ? "₦"
      : props?.Settings?.currency || "₦";

  const variantInfo = Array.isArray(props?.data?.combination)
    ? props.data.combination
        .map((c: any) => c.value.charAt(0).toUpperCase() + c.value.slice(1))
        .join(" · ")
    : "";

  return (
    <div className="cart-item" style={{ paddingTop: 12, paddingBottom: 12 }}>
      <div className="cart-item__image-wrap" style={{ cursor: "default" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={props?.data?.image}
          className="cart-item__image"
          alt={props?.data?.name || "Product"}
        />
      </div>
      <div className="cart-item__details">
        <div className="cart-item__name" style={{ cursor: "default" }}>
          {props?.data?.name}
          {variantInfo && (
            <span className="cart-item__variant"> — {variantInfo}</span>
          )}
        </div>
        <div className="cart-item__unit-price" style={{ marginTop: 4 }}>
          {currencySymbol} {formatCurrency(productPrice)} × {quantity}
        </div>
        <div className="cart-item__total" style={{ marginLeft: 0, marginTop: 6, fontSize: 16 }}>
          <span className="cart-item__total-label">{currencySymbol} </span>
          {formatCurrency(productPrice * quantity)}
        </div>
      </div>
    </div>
  );
};

export default CheckoutItem;
