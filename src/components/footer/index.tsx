"use client";
import React from "react";

import "./styles.scss";
import Link from "next/link";
import { Col, Container, Row } from "react-bootstrap";
import { usePathname } from "next/navigation";
import i18n from "../../lib/i18n";
import API from "@/config/configuration";
import Image from "next/image";

import { RiFacebookBoxFill } from "react-icons/ri";
import { BiLogoInstagramAlt } from "react-icons/bi";
import { FaSquareTwitter } from "react-icons/fa6";
import { I18nextProvider, useTranslation } from "react-i18next";

import Logo from "../../assets/images/new-logo.jpeg";
import GooglePlay from "../../assets/images/googleplay.png";
import AppleStore from "../../assets/images/appstore.png";

import Visa from "../../assets/images/visa.png";
import Mastercard from "../../assets/images/mastercard.png";
import Dinners from "../../assets/images/dinners.png";
import samsungpay from "../../assets/images/samsungpay.png";

const Footer = () => {
  const { t } = useTranslation();
  const pathname = usePathname();
  return pathname?.includes("/auth") ? null : (
    <footer className="Footer">
      <I18nextProvider i18n={i18n}>
        <Container fluid className="Footer-container">
          <Row>
            {/* Brand & About Section */}
            <Col sm={6} md={12} xs={12} lg={3}>
              <Link href={"/"} className="Footer_logoBox Footer_logoBox-modern">
                <div className="Footer-logo-wrapper">
                  <Image alt="Alaba Marketplace" src={Logo} className="Footer_logo" />
                </div>
                <div className="Footer-brand-text">Alaba</div>
              </Link>
              <div className="Footer-tagline">Marketplace</div>
              <br />
              <div className="Footer-text3">
                Discover a world of exceptional products and unbeatable deals at {API.NAME}. Your one-stop destination for the latest in fashion, electronics, home decor, beauty, and more.
              </div>
              
              {/* Social Media Icons */}
              <div className="Footer-social-links">
                <Row>
                  <Col sm={2} xs={2} className="Footer-icon">
                    <a target="_blank" rel="noreferrer">
                      <RiFacebookBoxFill />
                    </a>
                  </Col>
                  <Col sm={2} xs={2} className="Footer-icon">
                    <a target="_blank" rel="noreferrer">
                      <BiLogoInstagramAlt />
                    </a>
                  </Col>
                  <Col sm={2} xs={2} className="Footer-icon">
                    <a target="_blank" rel="noreferrer">
                      <FaSquareTwitter />
                    </a>
                  </Col>
                </Row>
              </div>
            </Col>

            {/* Seller Section */}
            <Col sm={6} md={6} xs={12} lg={2}>
              <div className="Footer-text1">Become a Seller</div>
              <div className="Footer-text2">
                <Link href="/seller_signup">Create Account</Link>
              </div>
              <div className="Footer-text2">
                <Link href="/seller_support">Seller Support</Link>
              </div>
            </Col>

            {/* Terms & Policy Section */}
            <Col sm={6} md={6} xs={12} lg={2}>
              <div className="Footer-text1">{t("terms_policy")}</div>
              <div className="Footer-text2">
                <Link href="privacy-policy">{t("privacy_policy")}</Link>
              </div>
              <div className="Footer-text2">
                <Link href="cookies-policy">Cookies Policy</Link>
              </div>
              <div className="Footer-text2">
                <Link href="terms_of_service">{t("terms_conditons")}</Link>
              </div>
              <div className="Footer-text2">
                <Link href="cancellation_return">{t("cancel_refund")}</Link>
              </div>
              <div className="Footer-text2">
                <Link href="access_statement">Accessibility Statement</Link>
              </div>
            </Col>

            {/* Support Section */}
            <Col sm={6} md={6} xs={12} lg={2}>
              <div className="Footer-text1">{t("contact_us")}</div>
              <div className="Footer-text2">
                <Link href="/fa-questions">FAQ's</Link>
              </div>
              <div className="Footer-text2">
                <Link href="contact_us">{t("contact")}</Link>
              </div>
              <div className="Footer-text2">
                <a href={`mailto:${API.CONTACT_MAIL}`}>{API.CONTACT_MAIL}</a>
              </div>
            </Col>

            {/* Payment Methods Section */}
            <Col sm={6} md={6} xs={12} lg={2}>
              <div className="Footer-text1">{t("payment_methrd")}</div>
              <Row className="Footer-payment-methods" style={{ gap: '8px' }}>
                <Col style={{ flex: '0 0 auto' }}>
                  <Image
                    alt="Visa"
                    src={Visa}
                    className="Footer_icon2"
                  />
                </Col>
                <Col style={{ flex: '0 0 auto' }}>
                  <Image
                    alt="Mastercard"
                    src={Mastercard}
                    className="Footer_icon2"
                  />
                </Col>
                <Col style={{ flex: '0 0 auto' }}>
                  <Image
                    alt="Diners Club"
                    src={Dinners}
                    className="Footer_icon2"
                  />
                </Col>
                <Col style={{ flex: '0 0 auto' }}>
                  <Image
                    alt="Samsung Pay"
                    src={samsungpay}
                    className="Footer_icon2"
                  />
                </Col>
              </Row>
            </Col>
            
            {/* Download App Section */}
            <Col sm={6} md={6} xs={12} lg={2}>
              <div className="Footer-text1">{t("download_app")}</div>
              <Row className="Footer-app-links">
                <Col sm={6} xs={6}>
                  <a target="_blank" rel="noreferrer">
                    <Image
                      src={GooglePlay}
                      alt="google play store"
                      className="Footer_img"
                    />
                  </a>
                </Col>
                <Col sm={6} xs={6}>
                  <a target="_blank" rel="noreferrer">
                    <Image
                      src={AppleStore}
                      alt="appstore"
                      className="Footer_img"
                    />
                  </a>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      </I18nextProvider>
      <br />
      <div className="Footer-Box1">
        COPYRIGHT © 2025 Alaba Marketplace LLC. ALL RIGHTS RESERVED
      </div>
    </footer>
  );
};

export default Footer;
