"use client";
import React from "react";
import { IoInformationCircleOutline } from "react-icons/io5";
import { GoArrowRight } from "react-icons/go";
import { useSelector } from "react-redux";
import { Alert, Spin } from "antd";
import CheckoutItem from "./checkoutItem";
import { LoadingOutlined } from "@ant-design/icons";
const antIcon = (
  <LoadingOutlined style={{ fontSize: 20, color: "#fff" }} spin />
);
const SummaryCard = (props: any) => {
  const Settings = useSelector((state: any) => state.Settings.Settings);

  return (
    <div className="Cart-SummaryCard">
      <div className="Cart-row">
        <div className="Cart-txt5">Checkout Summary</div>
        <div style={{ flex: 1 }} />
        <div className="Cart-txt6">{props?.Cart?.Checkout?.length} Item</div>
      </div>
      <div className="Cart-line" />
      {props?.Cart?.Checkout?.map((item: any, index: number) => {
        return <CheckoutItem key={index} data={item} Settings={Settings} />;
      })}
      <br />
      <div className="Cart-row">
        <div className="Cart-txt3">Total Product Price</div>
        <div style={{ flex: 1 }} />
        <div className="Cart-txt4">
          {Settings?.currency} {Number(props?.total).toFixed(2)}
        </div>
      </div>
      <div style={{ margin: 15 }} />
      <div className="Cart-row">
        <div className="Cart-txt3">Discount</div>
        <div style={{ flex: 1 }} />
        <div className="Cart-txt4 text-success">
          -{Settings?.currency} {Number(props?.discount).toFixed(2)}
        </div>
      </div>
      <div style={{ margin: 15 }} />
      <div className="Cart-row">
        <div className="Cart-txt3">Tax</div>
        <div style={{ flex: 1 }} />
        <div className="Cart-txt4">{Settings?.currency} 0.00</div>
      </div>
      <div style={{ margin: 15 }} />
      <div className="Cart-row">
        <div className="Cart-txt3">Delivery Charges</div>
        <div style={{ flex: 1 }} />
        <div className="Cart-txt4">
          {Settings?.currency} {Number(props?.delivery_charge).toFixed(2)}
        </div>
      </div>
      <div className="Cart-line2" />
      <div style={{ margin: 15 }} />
      <div className="Cart-row">
        <div className="Cart-txt3">Total :</div>
        <div style={{ flex: 1 }} />
        <div className="Cart-txt7">
          {Settings?.currency} {Number(props?.grand_total).toFixed(2)}
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
        style={{ cursor: "pointer" }}
        onClick={() => props?.placeOrder()}
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
