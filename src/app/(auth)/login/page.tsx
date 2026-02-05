"use client";
import { useEffect, useState } from "react";
import "./style.scss";
import EmailLogin from "./emailLogin";
import GmailLogin from "./gmailLogin";
import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import bgImage from "@/assets/images/position1.jpg"; // Using local asset
import { IoClose } from "react-icons/io5";
import { Button } from "antd";

function LoginScreen() {
  const navigation = useRouter();
  const [successmodal, setSuccessmodal] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

          <br />
          <GmailLogin
            openModal={() => setSuccessmodal(true)}
            closeModal={() => setSuccessmodal(false)}
          />
          <div
            className="LoginScreen-txt4"
            onClick={() => navigation.push("signup")}
          >
            Don't have an account?{" "}
            <span className="LoginScreen-txt5">Create Account</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
