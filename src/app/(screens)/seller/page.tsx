"use client";
import { Button } from "antd";
import React, { useState } from "react";
import { Col, Container, Row } from "react-bootstrap";
import { BsFillPatchQuestionFill } from "react-icons/bs";
import { FaLongArrowAltRight } from "react-icons/fa";
import Image from "next/image";
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
import { useSession } from "next-auth/react";
import { FaHandshakeSimple } from "react-icons/fa6";
import { IoDocumentText } from "react-icons/io5";
import { GiCrystalGrowth } from "react-icons/gi";
import sellerimg from "../../../assets/images/selllertitle.png";
import './style.scss';

function Page() {
  const navigation = useRouter();
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const { data: user } = useSession();
  const sellerFeatures = [
    {
      icon: <FaHandshakeSimple size={30} color={API.COLOR} />,
      title: "0% Commission Fee",
      description: `Suppliers selling on ${API.NAME} keep 100% of their profit by not paying any commission`,
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
      description: `From small to large and unbranded to branded, and now open for Sellers who don't have a Regular GSTIN too, ${API.NAME} fuels growth for all suppliers.`,
    },
  ];
  return (
    <div className="Screen-box">
      <br />
      <Container>
        {/* <Row>
          <Col sm={6} xs={12}>
            <br />
            <h4 className="sellerRegister-Heading">
              Begin your selling journey on {API.NAME}
            </h4>
            <br />
            <Row>
              {!user ? (
                <Col md={3} className="mb-2 mb-md-0">
                  <Button
                    size="large"
                    block
                    onClick={() => navigation.push("/login")}
                  >
                    Login
                  </Button>
                </Col>
              ) : null}

              <Col md={5} className="mb-2 mb-md-0">
                <Button
                  // type="primary"
                  className="btn-clr"
                  size="large"
                  block
                  onClick={() => navigation.push("/seller/corporate")}
                >
                  Register Now
                </Button>
              </Col>
            </Row>
            <br />
            <div>
              <p className="sellerRegister-text2">
                <FaLongArrowAltRight color={API.COLOR} size={20} />
                &nbsp; Individual
              </p>
              <p className="sellerRegister-text1">
                As an individual user on {API.NAME}, you gain access to a host
                of features designed to enhance your waitlisting experience.
                Receive instant updates on your wait time, allowing you to plan
                your activities with precision. The app ensures that you make
                the most of your valuable time, all while enjoying the
                convenience of being virtually in line.
              </p>

              <p className="sellerRegister-text1">
                You want to &nbsp; Start Doing Business with us &nbsp; as
                individual seller.{" "}
                <span
                  className="text-primary"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigation.push("/seller/individual")}
                >
                  Click here
                </span>
              </p>
              <p
                className="sellerRegister-text2"
                onClick={() => navigation.push("/seller/individual_info")}
              >
                More Info &nbsp;
                <BsFillPatchQuestionFill color={API.COLOR} size={16} />
              </p>
            </div>
          </Col>
          <Col sm={6} xs={12}>
            <Image
              src={sellerimg}
              alt="Seller Image"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </Col>
        </Row> */}

        <Row className="seller-row" justify="center">
          <Col md={12} sm={12}>
            <div className="seller-option-card"  onClick={() => navigation.push("/signup")}>
              <span>Register as Buyer</span>
              <span className="arrow">›</span>
            </div>
          </Col>

          <Col md={12} sm={12}>
            <div className="seller-option-card" onClick={() => navigation.push("/seller/corporate")}>
              <span>Become a Seller</span>
              <span className="arrow">›</span>
            </div>
          </Col>

          <Col md={12} sm={12}>
            <div className="seller-option-card" onClick={() => navigation.push("/seller/delivery-partner")}>
              <span>Register as Delivery Partner</span>
              <span className="arrow">›</span>
            </div>
          </Col>
        </Row>

        <br />
        <div className="sellerRegister-box12">
          <Row>
            <Col md="2" sm="6" xs="6">
              <div className="sellerRegister-banner-item">
                <FcConferenceCall size={50} />
                <span className="sellerRegister-text2">
                  Thousands of {API.NAME} customers
                </span>
              </div>
              <br />
            </Col>

            <Col md="2" sm="6" xs="6">
              <div className="sellerRegister-banner-item">
                <FcBearish size={50} />
                <span className="sellerRegister-text2">
                  Low cost of doing business
                </span>
              </div>
              <br />
            </Col>
            <Col md="2" sm="6" xs="6">
              <div className="sellerRegister-banner-item">
                <FcMoneyTransfer size={50} />
                <span className="sellerRegister-text2">
                  7* days secure & regular payments
                </span>
              </div>
              <br />
            </Col>

            <Col md="2" sm="6" xs="6">
              <div className="sellerRegister-banner-item">
                <FcCustomerSupport size={50} />
                <span className="sellerRegister-text2">
                  One click Seller Support
                </span>
              </div>
              <br />
            </Col>
            <Col md="2" sm="6" xs="6">
              <div className="sellerRegister-banner-item">
                <FcInTransit size={50} />
                <span className="sellerRegister-text2">
                  Faster shipping across the country
                </span>
              </div>
              <br />
            </Col>
            <Col md="2" sm="6" xs="6">
              <div className="sellerRegister-banner-item">
                <FcBriefcase size={50} />
                <span className="sellerRegister-text2">
                  Acces to shopping Festivals
                </span>
              </div>
              <br />
            </Col>
          </Row>
        </div>
        <br />
        <Row>
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
                <div key={index} style={{ display: "flex" }}>
                  <div style={{ marginRight: "15px" }}>{feature.icon}</div>
                  <div>
                    <p className="sellerRegister-text2">{feature.title}</p>
                    <p className="sellerRegister-text1">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Col>
        </Row>
        <br />
      </Container>
      {/* {isLoginModalVisible ? (
        <SellerLoginModal
          open={isLoginModalVisible}
          onCancel={() => setIsLoginModalVisible(false)}
        />
      ) : null} */}
    </div>
  );
}

export default Page;
