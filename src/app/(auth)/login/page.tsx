"use client";
import { useEffect, useState } from "react";
import "./style.scss";
import EmailLogin from "./emailLogin";
import GmailLogin from "./gmailLogin";
import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import bgImage from "@/assets/images/position1.jpg";
import { IoClose } from "react-icons/io5";
import { Button } from "antd";
import CONFIG from "@/config/configuration";
import Logo from "@/assets/images/new-logo.jpeg";

/* ─── MAINTENANCE FLAG — set to false to restore login ─────────────────── */
const SITE_UNDER_MAINTENANCE = true;
/* ───────────────────────────────────────────────────────────────────────── */

function MaintenancePage() {
  const router = useRouter();
  return (
    <div className="auth-maintenance-wrapper">
      {/* Animated background blobs */}
      <div className="auth-maintenance-blob auth-maintenance-blob--1" />
      <div className="auth-maintenance-blob auth-maintenance-blob--2" />
      <div className="auth-maintenance-blob auth-maintenance-blob--3" />

      <div className="auth-maintenance-card">
        {/* Logo */}
        <div className="auth-maintenance-logo">
          <Image
            src={Logo}
            alt={CONFIG.NAME}
            width={56}
            height={56}
            style={{ borderRadius: 14, objectFit: "cover" }}
          />
        </div>

        {/* Icon */}
        <div className="auth-maintenance-icon">
          <span>🔧</span>
        </div>

        {/* Heading */}
        <h1 className="auth-maintenance-title">We&apos;ll Be Back Soon</h1>
        <p className="auth-maintenance-subtitle">
          {CONFIG.NAME} is currently undergoing scheduled maintenance to improve
          your experience. We apologise for the inconvenience and expect to be
          back online shortly.
        </p>

        {/* Divider */}
        <div className="auth-maintenance-divider" />

        {/* Contact box */}
        <div className="auth-maintenance-contact-box">
          <p className="auth-maintenance-contact-label">
            Need help or want to place an order?
          </p>
          <p className="auth-maintenance-contact-sub">
            Our customer service team is available to assist you with
            alternative payment methods and order support.
          </p>
          <div className="auth-maintenance-links">
            <a
              href={`mailto:${CONFIG.CONTACT_MAIL}`}
              className="auth-maintenance-link"
            >
              <span className="auth-maintenance-link-icon">✉️</span>
              {CONFIG.CONTACT_MAIL}
            </a>
            <a
              href={`tel:${CONFIG.CONTACT_NUMBER.replace(/\s/g, "")}`}
              className="auth-maintenance-link"
            >
              <span className="auth-maintenance-link-icon">📞</span>
              {CONFIG.CONTACT_NUMBER}
            </a>
          </div>
        </div>

        {/* CTA */}
        <button
          className="auth-maintenance-btn"
          onClick={() => router.push("/")}
        >
          Back to Homepage
        </button>

        <p className="auth-maintenance-footer">
          &copy; {new Date().getFullYear()} {CONFIG.NAME} &middot;{" "}
          {CONFIG.WEBSITE}
        </p>
      </div>
    </div>
  );
}

function LoginScreen() {
  const navigation = useRouter();
  const [successmodal, setSuccessmodal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (SITE_UNDER_MAINTENANCE) {
    return <MaintenancePage />;
  }

  return (
    <div className="auth-login-wrapper">
      <div className="auth-container position-relative">
        <Button
          type="text"
          shape="circle"
          icon={<IoClose size={24} />}
          className="position-absolute top-0 end-0 m-3 z-3 bg-white shadow-sm"
          onClick={() => navigation.push("/")}
          title="Close"
        />
        {/* Left Side - Image */}
        <div
          className="auth-image-side"
          style={{ backgroundImage: `url(${bgImage.src})` }}
        >
          <div className="auth-image-text">
            <h3>Welcome to Alabamarket</h3>
            <p>
              Your one-stop destination for quality products at the best prices.
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-form-side">
          <h2 className="LoginScreen-txt1">Welcome Back</h2>
          <div className="LoginScreen-txt2">
            Sign in to manage your orders, check your wishlist, and continue
            shopping.
          </div>

          <EmailLogin />

          <div className="auth-divider">or</div>
          <GmailLogin
            openModal={() => setSuccessmodal(true)}
            closeModal={() => setSuccessmodal(false)}
          />
          <div
            className="LoginScreen-txt4"
            onClick={() => navigation.push("signup")}
          >
            Don&apos;t have an account?{" "}
            <span className="LoginScreen-txt5">Create Account</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
