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
      icon: <FaHandshakeSimple size={22} color={API.COLOR} />,
      title: "5% Commission Fee",
      description: `Suppliers selling on ${API.NAME} keep 95% of their profit with a 5% commission fee`,
    },
    {
      icon: <IoDocumentText size={22} color={API.COLOR} />,
      title: "0 Penalty Charges",
      description:
        "Sell online without the fear of order cancellation charges with 0 Penalty for late dispatch or order cancellations.",
    },
    {
      icon: <GiCrystalGrowth size={22} color={API.COLOR} />,
      title: "Growth for Every Supplier",
      description: `From small to large and unbranded to branded, and now open for Sellers who don't have a formal Business Registration too, ${API.NAME} fuels growth for all suppliers.`,
    },
  ];

  return (
    <div className="seller-screen-box">
      <Container>
        {/* Hero */}
        <div className="seller-hero-section">
          <h1>
            Start Your Business on <span>{API.NAME}</span>
          </h1>
          <p>
            Join thousands of sellers and reach millions of customers across
            Nigeria. 5% commission, fast payments, and dedicated support.
          </p>
        </div>

        {/* Option Cards */}
        <Row className="seller-row" justify="center">
          <Col md={12} sm={12}>
            <div
              className="seller-option-card"
              onClick={() => navigation.push("/signup")}
            >
              <div className="seller-option-card__icon">
                <FcConferenceCall size={28} />
              </div>
              <div className="seller-option-card__body">
                <span className="seller-option-card__title">
                  Register as Buyer
                </span>
                <span className="seller-option-card__desc">
                  Browse thousands of products at the best prices
                </span>
              </div>
              <span className="arrow">›</span>
            </div>
          </Col>

          <Col md={12} sm={12}>
            <div
              className="seller-option-card"
              onClick={() => navigation.push("/seller/corporate")}
            >
              <div className="seller-option-card__icon">
                <FcBriefcase size={28} />
              </div>
              <div className="seller-option-card__body">
                <span className="seller-option-card__title">
                  Become a Seller
                </span>
                <span className="seller-option-card__desc">
                  List your products and earn with only 5% commission
                </span>
              </div>
              <span className="arrow">›</span>
            </div>
          </Col>

          <Col md={12} sm={12}>
            <div
              className="seller-option-card"
              onClick={() => navigation.push("/seller/delivery-partner")}
            >
              <div className="seller-option-card__icon">
                <FcInTransit size={28} />
              </div>
              <div className="seller-option-card__body">
                <span className="seller-option-card__title">
                  Register as Delivery Partner
                </span>
                <span className="seller-option-card__desc">
                  Earn by delivering orders across Nigeria
                </span>
              </div>
              <span className="arrow">›</span>
            </div>
          </Col>
        </Row>

        {/* Stats Banner */}
        <div className="sellerRegister-box12">
          <p className="sellerRegister-banner-label">Why sellers choose us</p>
          <Row>
            <Col md="2" sm="6" xs="6">
              <div className="sellerRegister-banner-item">
                <div className="sellerRegister-banner-item__icon">
                  <FcConferenceCall size={26} />
                </div>
                <span className="sellerRegister-text2">
                  Thousands of customers
                </span>
              </div>
            </Col>

            <Col md="2" sm="6" xs="6">
              <div className="sellerRegister-banner-item">
                <div className="sellerRegister-banner-item__icon">
                  <FcBearish size={26} />
                </div>
                <span className="sellerRegister-text2">
                  Low cost of business
                </span>
              </div>
            </Col>

            <Col md="2" sm="6" xs="6">
              <div className="sellerRegister-banner-item">
                <div className="sellerRegister-banner-item__icon">
                  <FcMoneyTransfer size={26} />
                </div>
                <span className="sellerRegister-text2">
                  Secure & regular payments
                </span>
              </div>
            </Col>

            <Col md="2" sm="6" xs="6">
              <div className="sellerRegister-banner-item">
                <div className="sellerRegister-banner-item__icon">
                  <FcCustomerSupport size={26} />
                </div>
                <span className="sellerRegister-text2">One click support</span>
              </div>
            </Col>

            <Col md="2" sm="6" xs="6">
              <div className="sellerRegister-banner-item">
                <div className="sellerRegister-banner-item__icon">
                  <FcInTransit size={26} />
                </div>
                <span className="sellerRegister-text2">Faster shipping</span>
              </div>
            </Col>

            <Col md="2" sm="6" xs="6">
              <div className="sellerRegister-banner-item">
                <div className="sellerRegister-banner-item__icon">
                  <FcBriefcase size={26} />
                </div>
                <span className="sellerRegister-text2">Shopping festivals</span>
              </div>
            </Col>
          </Row>
        </div>

        {/* Why Suppliers Love + Features */}
        <Row className="g-3">
          <Col md={6}>
            <div className="sellerRegister-box4">
              <h4 className="sellerRegister-subHeading">
                Why Suppliers Love {API.NAME}
              </h4>
              <p className="sellerRegister-text1">
                All the benefits that come with selling on {API.NAME} are
                designed to help you sell more, and make it easier to grow your
                business. Selling on {API.NAME} opens up a world of
                opportunities for businesses, providing a platform that goes
                beyond traditional selling channels.
              </p>
            </div>
          </Col>
          <Col md={6}>
            <div className="sellerRegister-box5">
              {sellerFeatures.map((feature, index) => (
                <div key={index} className="seller-feature-item">
                  <div className="seller-feature-item__icon">
                    {feature.icon}
                  </div>
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
