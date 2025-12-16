import React, { useState } from "react";
import { RiDeleteBinLine } from "react-icons/ri";
import { Row, Col } from "react-bootstrap";
import { Button, Popconfirm, Space } from "antd";

import useDebounce from "../../../../shared/hook/useDebounce";
import useDidUpdateEffect from "../../../../shared/hook/useDidUpdate";
import { useRouter } from "next/navigation";
// import { useNavigate } from "react-router-dom";

const CartItem = (props: any) => {
  //   const navigate = useNavigate();
  const router = useRouter();
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
      <div
        onClick={() => {
          router.push(`/${props?.data?.slug}/?pid=${props?.data?.pid}&review=2`);
          // router.push(
          //   `/product/${props?.data?.slug}?pid=${props?.data?.pid}${
          //     props?.data?.variantId ? `&vid=${props?.data?.variantId}` : ""
          //   }`
          // );
        }}
      >
        <img src={props?.data?.image} className="Cart-CartItem-img" />
      </div>
      <div style={{ flex: 1 }}>
        <Row>
          <Col sm={6} xs={12}>
            <div className="Cart-CartItem-txt1">
              {props?.data?.name} {getActiveVariant(props?.data)}
            </div>
            <div className="Cart-CartItem-txt55">
              Seller : <span>{props?.data?.storeName}</span>
            </div>
            <div className="Cart-CartItem-txt2">
              Unit Price :{" "}
              <span style={{ color: "#000" }}>
                {props?.Settings?.currency}{" "}
                {Number(props?.data?.price).toFixed(2)}
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
          <Col sm={6} xs={12}>
            <div
              className="Cart-row"
              style={{ alignItems: "center", height: "100%" }}
            >
              <div>
                <Space.Compact block>
                  <Button
                  disabled={props.data.quantity===1}
                    onClick={() => {
                      if (props?.loading == false) {
                        props?.updateQuantity("reduce", props?.data);
                      }
                    }}
                  >
                    -
                  </Button>
                  <Button>{props?.data?.quantity}</Button>
                  <Button
                    onClick={() => {
                      if (props?.loading == false) {
                        props?.updateQuantity("add", props?.data);
                      }
                    }}
                  >
                    +
                  </Button>
                </Space.Compact>
              </div>
              <div style={{ flex: 1 }}></div>
              <div className="Cart-CartItem-txt3">
                <span style={{ color: "grey", fontSize: 14 }}>
                  {props?.Settings?.currency}{" "}
                </span>
                {Number(props?.data?.totalPrice).toFixed(2)}
              </div>
              <div>
                <Popconfirm
                  placement="bottomRight"
                  title={"Are you sure to remove item from cart?"}
                  okText="Yes"
                  cancelText="No"
                  className="ms-auto align-self-center"
                  onConfirm={() =>
                    props?.removeItem(props?.data?.id, props?.data)
                  }
                >
                  <RiDeleteBinLine size={20} />
                </Popconfirm>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default CartItem;
