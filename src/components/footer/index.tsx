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
import { FaTiktok } from "react-icons/fa6";
import { MdKeyboardArrowUp } from "react-icons/md";
import { I18nextProvider, useTranslation } from "react-i18next";

import Logo from "../../assets/images/new-logo.jpeg";
import GooglePlay from "../../assets/images/googleplay.png";
import AppleStore from "../../assets/images/appstore.png";

import Visa from "../../assets/images/visa.png";
import Mastercard from "../../assets/images/mastercard.png";
import paystacklogo from "../../assets/images/paystack-logo.png";

const Footer = () => {
  const { t } = useTranslation();
  const pathname = usePathname();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return pathname?.includes("/auth") ? null : (
    <footer className="Footer">
      <I18nextProvider i18n={i18n}>
        <Container fluid className="Footer-container">
          <Row>
            <Col sm={6} md={12} xs={12} lg={3}>
              <Link href={"/"} className="Footer_logoBox">
                <div>
                  <Image alt="" src={Logo} className="Footer_logo" />
                </div>
                {/* <div style={{ marginTop: 5 }}>{API.NAME}</div> */}
              </Link>
              <br />
              <div className="Footer-text3">
                Discover a world of exceptional products and unbeatable deals at
                {API.NAME}. Your one-stop destination for the latest in fashion,
                electronics, home decor, beauty, and more.
              </div>
              <div style={{ margin: 10 }} />
              <Row>
                <Col sm={2} xs={2} className="Footer-icon">
                  <a
                    href="https://www.facebook.com/share/1DDZ2hKrKk/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <RiFacebookBoxFill />
                  </a>
                </Col>
                <Col sm={2} xs={2} className="Footer-icon">
                  <a
                    href="https://www.instagram.com/alaba_marketplace"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <BiLogoInstagramAlt />
                  </a>
                </Col>
                <Col sm={2} xs={2} className="Footer-icon">
                  <a
                    href="https://www.twitter.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaSquareTwitter />
                  </a>
                </Col>
                <Col sm={2} xs={2} className="Footer-icon">
                  <a
                    href="https://www.tiktok.com/@alabamarketplace"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaTiktok />
                  </a>
                </Col>
              </Row>
            </Col>
            <Col sm={6} md={6} xs={12} lg={2}>
              <div className="Footer-text1">Become a Seller</div>
              <div className="Footer-text2">
                <Link href="/seller_signup">Create Account</Link>
              </div>
              {/* <div className="Footer-text2">
                <Link
                  target="_blank"
                  href="https://play.google.com/store/apps/details?id=com.nextmeseller&hl=en_AU"
                >
                  Seller App
                </Link>
              </div> */}
              <div className="Footer-text2">
                <Link href="/seller_support">Seller Support</Link>
              </div>
            </Col>

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
            <Col sm={6} md={6} xs={12} lg={2}>
              <div className="Footer-text1">{t("contact_us")}</div>
              <div className="Footer-text2">
                <Link href="/fa-questions">FAQs</Link>
              </div>
              <div className="Footer-text2">
                <Link href="/about-us">About us</Link>
              </div>
              <div className="Footer-text2">
                <Link href="contact_us">{t("contact")}</Link>
              </div>
              <div className="Footer-text2">
                <a href={`mailto:${API.CONTACT_MAIL}`}>{API.CONTACT_MAIL}</a>
              </div>
              <div className="Footer-text2">
                {/* <a href="tel:+917001800600">{API.CONTACT_NUMBER}</a> */}
              </div>
            </Col>
            <Col sm={6} md={6} xs={12} lg={3}>
              <div className="Footer-text1">{t("payment_methrd")}</div>
              <Row>
                <Col sm={2} xs={2}>
                  <Image
                    alt="AlabaMarketplace"
                    src={Visa}
                    className="Footer_icon2"
                  />
                </Col>
                <Col sm={2} xs={2}>
                  <Image
                    alt="AlabaMarketplace"
                    src={Mastercard}
                    className="Footer_icon2"
                  />
                </Col>
                <Col sm={2} xs={2}>
                  <Image
                    alt="AlabaMarketplace"
                    src={paystacklogo}
                    className="Footer_icon2"
                  />
                </Col>
              </Row>
              <div className="Footer-text1">{t("download_app")}</div>
              <Row>
                <Col sm={6} xs={6}>
                  <a
                    target="_blank"
                    href="https://play.google.com/store/apps/details?id=com.alabauserapp"
                  >
                    <Image
                      src={GooglePlay}
                      alt="google play store"
                      className="Footer_img"
                    />
                  </a>
                </Col>
                <Col sm={6} xs={6}>
                  <a
                    target="_blank"
                    // href="https://apps.apple.com/in/app/next-me/id6504331008"
                  >
                    <Image
                      src={AppleStore}
                      alt="appstore"
                      className="Footer_img"
                    />
                  </a>
                </Col>
              </Row>
              <div className="back-to-top-container">
                <button
                  onClick={scrollToTop}
                  className="back-to-top-btn"
                  title="Back to top"
                >
                  <MdKeyboardArrowUp />
                </button>
              </div>
            </Col>
          </Row>
        </Container>
      </I18nextProvider>
      <br />
      <div className="Footer-Box1">
        COPYRIGHT © 2025 Taxgoglobal Corporation. ALL RIGHTS RESERVED
      </div>
    </footer>
  );
};

export default Footer;
