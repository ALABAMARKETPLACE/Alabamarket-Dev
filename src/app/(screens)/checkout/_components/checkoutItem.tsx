"use client";
import React from "react";
import { Row, Col } from "react-bootstrap";

const CheckoutItem = (props: any) => {
  const productPrice = Number(props?.data?.buyPrice);

  let stock = "In Stock";
  if (Number(props?.data?.unit) == 0 || props?.data?.status == false) {
    stock = "Out of Stock";
  } else if (Number(props?.data?.unit) < props?.data?.quantity) {
    stock = `Only ${props?.data?.unit} left`;
  }
  function capitalizeFirstLetter(text: string) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
  const getActiveVariant = (data: any): string => {
    let variantInfo = "";
    if (Array.isArray(data?.combination) == true) {
      data?.combination.forEach((item: any) => {
        variantInfo += ` ${capitalizeFirstLetter(item.value)}`;
      });
    }

    return variantInfo;
  };
  return (
    <div className="Cart-CartItem">
      <div>
        <img src={props?.data?.image} className="Cart-CartItem-img" />
      </div>
      <div style={{ flex: 1 }}>
        <Row>
          <Col sm={8} xs={8}>
            <div className="Cart-CartItem-txt1">
              {props?.data?.name}{" "}
              {getActiveVariant(props?.data)}
            </div>
            <div className="Cart-CartItem-txt2">
              Unit Price :{" "}
              <span style={{ color: "#000" }}>
                {Number(productPrice).toFixed(2)} x {props?.data?.quantity}
              </span>
            </div>
            <div
              className={`Cart-CartItem-txt4 ${
                stock === "In Stock" ? "green" : "red"
              }`}
            >
              {stock}
            </div>
          </Col>
          <Col sm={4} xs={12}>
            <div
              className="Cart-row"
              style={{ alignItems: "center", height: "100%" }}
            >
              <div style={{ flex: 1 }} />
              <div className="Cart-txt4">
                <span style={{ color: "grey", fontSize: 14 }}>
                  {props?.Settings?.currency}&nbsp;
                </span>
                {Number(productPrice * props?.data?.quantity).toFixed(2)}
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CheckoutItem;
