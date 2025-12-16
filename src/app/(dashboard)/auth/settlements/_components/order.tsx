import React from "react";
import { Col, Row } from "react-bootstrap";
import { FcBullish, FcInTransit } from "react-icons/fc";
import { FcBearish } from "react-icons/fc";
import { MdTrolley } from "react-icons/md";
// import API from "../../../config/API";
import "../style.scss";
import API from "@/config/API";
const SettlementOrders = ({ order }: any) => {
  const cardData = [
    {
      title: "TOTAL ORDERS",
      amount: order.totalOrders,
      icon: <FcInTransit size={50} />,
    },
    {
      title: "PENDING ORDERS",
      amount: order?.pendingOrders,
      icon: <MdTrolley size={45} color={API.COLOR} />,
    },
    {
      title: "CANCELLED ORDERS",
      amount: order?.cancelledOrders,
      icon: <FcBearish size={42} />,
    },
    {
      title: "DELIVERED ORDERS",
      amount: `${order?.deliveredOrders ?? 0}`,
      icon: <FcBullish size={42} />,
    },
    {
      title: "SHIPPED ORDERS",
      amount: `${order?.shippedOrders ?? 0}`,
      icon: <FcBullish size={42} />,
    },
    {
      title: "OUT FOR DELIVERY",
      amount: `${order?.out_for_deliveryOrders ?? 0}`,
      icon: <FcBullish size={42} />,
    },
    {
      title: "PACKED ORDERS",
      amount: `${order?.packedOrders ?? 0}`,
      icon: <FcBullish size={42} />,
    },
    {
      title: "REJECTED ORDERS",
      amount: `${order?.rejectedOrders ?? 0}`,
      icon: <FcBullish size={42} />,
    },
    {
      title: "PROCESSING ORDERS",
      amount: `${order?.processingOrders ?? 0}`,
      icon: <FcBullish size={42} />,
    },
    {
      title: "FAILED ORDERS",
      amount: `${order?.failedOrders ?? 0}`,
      icon: <FcBullish size={42} />,
    },
  ];
  return (
    <Row className="gy-3">
      {cardData.map((item: any) => (
        <Col key={item} md={3}>
          <div className="productsOverView-Boxsettlement">
            <div>
              <div className="productsOverView-Txt1settlement">
                {item.title}
              </div>

              <div className="productsOverView-Txt2settlement mt-3">
                {item.amount}
              </div>
            </div>
            <div></div>
          </div>
        </Col>
      ))}
    </Row>
  );
};

export default SettlementOrders;
