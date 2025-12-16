"use client";
import { useEffect, useState } from "react";
import "./style.scss";
import EmailLogin from "./emailLogin";
import GmailLogin from "./gmailLogin";
import React from "react";
import { useRouter } from "next/navigation";

function LoginScreen() {
  const navigation = useRouter();
  const [successmodal, setSuccessmodal] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsLoaded(true);
  }, []);

  return (
    <div className="login-screen-wrapper">
      <div className="login-screen-container">
        <div className="login-screen-card">
          {/* Animated background elements */}
          <div className="auth-bg-blob auth-bg-blob-1"></div>
          <div className="auth-bg-blob auth-bg-blob-2"></div>

          {/* Content */}
          <div className={`login-screen-content ${isLoaded ? 'loaded' : ''}`}>
            {/* Header Section */}
            <div className="login-screen-header">
              <h1 className="login-screen-title">Welcome Back</h1>
              <p className="login-screen-subtitle">
                Sign in or create your account to get started
              </p>
            </div>

            {/* Forms Section */}
            <div className="login-screen-forms">
              <div className="form-wrapper email-form-wrapper">
                <EmailLogin />
              </div>

              {/* Divider */}
              <div className="login-screen-divider">
                <span>Or continue with</span>
              </div>

              {/* Social Login */}
              <div className="form-wrapper gmail-form-wrapper">
                <GmailLogin
                  openModal={() => setSuccessmodal(true)}
                  closeModal={() => setSuccessmodal(false)}
                />
              </div>
            </div>

            {/* Footer Section */}
            <div className="login-screen-footer">
              <p className="login-screen-footer-text">
                Don't have an account?{" "}
                <button
                  className="login-screen-signup-link"
                  onClick={() => navigation.push("signup")}
                >
                  Create Account
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
