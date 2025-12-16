"use client";
import { useEffect, useState } from "react";
import "./style.scss";
import EmailLogin from "./emailLogin";
import GmailLogin from "./gmailLogin";
// COMMENTED: Phone Login removed as per requirement
// import PhoneLogin from "./phoneLogin";
import React from "react";
// import SuccessModal from "../../components/successModal";
import { useRouter } from "next/navigation";
function LoginScreen() {
  const navigation = useRouter();
  // COMMENTED: Phone/Email toggle removed - only Email Login available
  // const [useEmail, setUseEmail] = useState(false);
  const [successmodal, setSuccessmodal] = useState(false);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="Screen-box">
      <br /> <br />
      <div className="container">
        <div className="row">
          <div className="col-12 col-xs-12 col-md-3 col-xl-4"></div>
          <div className="col-12 col-md-6 col-xl-4">
            <h2 className="LoginScreen-txt1 text-center">
              Sign in or create your account
            </h2>
            <div className="LoginScreen-txt2 text-center">
              Please enter the following details to login
            </div>
            <div className="LoginScreen-box1">
              {/* COMMENTED: Phone Login functionality removed */}
              {/* {useEmail ? (
                <>
                  <EmailLogin />
                  <div
                    className="LoginScreen-txt6"
                    onClick={() => setUseEmail(false)}
                  >
                    Phone Login
                  </div>
                </>
              ) : (
                <div>
                  <PhoneLogin />
                  <div
                    className="LoginScreen-txt6"
                    onClick={() => setUseEmail(true)}
                  >
                    Email Login
                  </div>
                </div>
              )} */}

              {/* Only Email Login available */}
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
          <div className="col-12 col-md-3 col-xl-4"></div>
        </div>
      </div>
      <br />
      <br />
      {/* <SuccessModal
        visible={successmodal}
        onCancel={() => setSuccessmodal(false)}
        title="success"
        body="Account created successfully"
        onButtonClick={() => setSuccessmodal(false)}
        buttonText="Go Back"
      /> */}
    </div>
  );
}
export default LoginScreen;
