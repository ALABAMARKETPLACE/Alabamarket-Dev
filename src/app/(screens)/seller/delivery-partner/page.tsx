"use client";
import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa";
import API from "../../../../config/API";
import "../../seller/style.scss";

function DeliveryPartnerSelection() {
  const navigation = useRouter();

  return (
    <div className="Screen-box">
      <br />
      <Container>
        <div className="sellerRegister-row">
          <div>
            <h4 className="sellerRegister-Heading">
              Register as Delivery Partner
            </h4>
          </div>
          <button
            style={{ border: "none", backgroundColor: "transparent", cursor: "pointer" }}
            onClick={() => navigation.push("/seller")}
          >
            <FaArrowLeft size={20} />
          </button>
        </div>
        <hr />
        <p className="sellerRegister-text1 mb-4">
          Choose your registration type below:
        </p>

        <Row className="seller-row" justify="center">
          <Col md={12} sm={12}>
            <div
              className="seller-option-card"
              onClick={() => navigation.push("/seller/delivery-company")}
            >
              <div>
                <strong>Register as Delivery Company</strong>
                <p className="mb-0 mt-2" style={{ fontSize: "14px", color: "#666" }}>
                  Register your delivery business and manage a fleet of drivers
                </p>
              </div>
              <span className="arrow">›</span>
            </div>
          </Col>

          <Col md={12} sm={12}>
            <div
              className="seller-option-card"
              onClick={() => navigation.push("/seller/driver")}
            >
              <div>
                <strong>Register as Driver</strong>
                <p className="mb-0 mt-2" style={{ fontSize: "14px", color: "#666" }}>
                  Join as an individual driver and start earning
                </p>
              </div>
              <span className="arrow">›</span>
            </div>
          </Col>
        </Row>

        <br />
      </Container>
    </div>
  );
}

export default DeliveryPartnerSelection;
