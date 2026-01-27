"use client";
import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import {
  FcBearish,
  FcBriefcase,
  FcConferenceCall,
  FcCustomerSupport,
  FcInTransit,
  FcMoneyTransfer,
} from "react-icons/fc";
import API from "../../../config/API";
import { useRouter } from "next/navigation";
import { FaHandshakeSimple } from "react-icons/fa6";
import { IoDocumentText } from "react-icons/io5";
import { GiCrystalGrowth } from "react-icons/gi";

function Page() {
  const navigation = useRouter();
  const sellerFeatures = [
    {
      icon: <FaHandshakeSimple size={30} color={API.COLOR} />,
      title: "5% Commission Fee",
      description: `Suppliers selling on ${API.NAME} keep 95% of their profit with a 5% commission fee`,
    },
    {
      icon: <IoDocumentText size={30} color={API.COLOR} />,
      title: "0 Penalty Charges",
      description:
        "Sell online without the fear of order cancellation charges with 0 Penalty for late dispatch or order cancellations.",
    },
    {
      icon: <GiCrystalGrowth size={30} color={API.COLOR} />,
      title: "Growth for Every Supplier",
      description: `From small to large and unbranded to branded, and now open for Sellers who don't have a formal Business Registration too, ${API.NAME} fuels growth for all suppliers.`,
    },
  ];
  return (
    <div className="seller-screen-box">
      <Container>
        <div className="seller-hero-section">
          <h1>
            Start Your Business on <span>{API.NAME}</span>
          </h1>
          <p>
            Join thousands of sellers and reach millions of customers across
            Nigeria. 5% commission, fast payments, and dedicated support.
          </p>
        </div>

        <Row className="seller-row" justify="center">
          <Col md={12} sm={12}>
            <div
              className="seller-option-card"
              onClick={() => navigation.push("/signup")}
            >
              <span>Register as Buyer</span>
              <span className="arrow">›</span>
            </div>
          </Col>

          <Col md={12} sm={12}>
            <div
              className="seller-option-card"
              onClick={() => navigation.push("/seller/corporate")}
            >
              <span>Become a Seller</span>
              <span className="arrow">›</span>
            </div>
          </Col>

          <Col md={12} sm={12}>
            <div
              className="seller-option-card"
              onClick={() => navigation.push("/seller/delivery-partner")}
            >
              <span>Register as Delivery Partner</span>
              <span className="arrow">›</span>
            </div>
          </Col>
        </Row>

        <div className="sellerRegister-box12">
          <Row>
            <Col md="2" sm="6" xs="6">
              <div className="sellerRegister-banner-item">
                <FcConferenceCall size={32} />
                <span className="sellerRegister-text2">
                  Thousands of customers
                </span>
              </div>
            </Col>

            <Col md="2" sm="6" xs="6">
              <div className="sellerRegister-banner-item">
                <FcBearish size={32} />
                <span className="sellerRegister-text2">
                  Low cost of business
                </span>
              </div>
            </Col>
            <Col md="2" sm="6" xs="6">
              <div className="sellerRegister-banner-item">
                <FcMoneyTransfer size={32} />
                <span className="sellerRegister-text2">
                  Secure & regular payments
                </span>
              </div>
            </Col>

            <Col md="2" sm="6" xs="6">
              <div className="sellerRegister-banner-item">
                <FcCustomerSupport size={32} />
                <span className="sellerRegister-text2">One click Support</span>
              </div>
            </Col>
            <Col md="2" sm="6" xs="6">
              <div className="sellerRegister-banner-item">
                <FcInTransit size={32} />
                <span className="sellerRegister-text2">Faster shipping</span>
              </div>
            </Col>
            <Col md="2" sm="6" xs="6">
              <div className="sellerRegister-banner-item">
                <FcBriefcase size={32} />
                <span className="sellerRegister-text2">Shopping Festivals</span>
              </div>
            </Col>
          </Row>
        </div>

        <Row className="g-3">
          <Col md={6}>
            <div className="sellerRegister-box4">
              <h4 className="sellerRegister-subHeading">
                Why Suppliers Love {API.NAME}
              </h4>
              <p className="sellerRegister-text1">
                All the benefits that come with selling on {API.NAME} are
                designed to help you sell more, and make it easier to grow your
                business.Selling on {API.NAME} opens up a world of opportunities
                for businesses, providing a platform that goes beyond
                traditional selling channels.
              </p>
            </div>
          </Col>
          <Col md={6}>
            <div className="sellerRegister-box5">
              {sellerFeatures.map((feature, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    marginBottom: index === sellerFeatures.length - 1 ? 0 : 15,
                  }}
                >
                  <div style={{ marginRight: "12px" }}>{feature.icon}</div>
                  <div>
                    <p
                      className="sellerRegister-text2"
                      style={{ marginBottom: 4 }}
                    >
                      {feature.title}
                    </p>
                    <p
                      className="sellerRegister-text1"
                      style={{ marginBottom: 0 }}
                    >
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Page;
