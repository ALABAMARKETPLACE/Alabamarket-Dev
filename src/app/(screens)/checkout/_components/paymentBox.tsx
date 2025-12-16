"use client";
import React from "react";
import { Row, Col } from "react-bootstrap";
import { IoCardOutline } from "react-icons/io5";
import { IoCashOutline } from "react-icons/io5";
import { HiOutlineCash } from "react-icons/hi";
import { IoIosRadioButtonOff, IoMdRadioButtonOn } from "react-icons/io";

import Visa from "../../../../assets/images/visa.png";
import Mster from "../../../../assets/images/mastercard.png";
import Diners from "../../../../assets/images/dinners.png";
import Samsu from "../../../../assets/images/samsungpay.png";
import { BsBank } from "react-icons/bs";
import { FaRegCreditCard } from "react-icons/fa6";
import { MdPayments } from "react-icons/md";
import Image from "next/image";
function PaymentBox(props: any) {
  return (
    <div>
      <div className="Cart-row" style={{ padding: 0 }}>
        <div className="Cart-txt1">
          <span className="Cart-txt1Icon">
            <IoCashOutline />
          </span>
          PAYMENT MEHTOD
        </div>
      </div>
      <div className="Cart-line" />
      <br />
      <div
        className={`Cart-paymentBox ${
          props?.method === "Pay Online" ? "active" : ""
        }`}
        onClick={() => props?.onChange("Pay Online")}
      >
        <div style={{ marginRight: 20 }}>
          {props?.method === "Pay Online" ? (
            <IoMdRadioButtonOn size={25} />
          ) : (
            <IoIosRadioButtonOff size={25} />
          )}
        </div>
        <div style={{ marginRight: 10 }}>
          <IoCardOutline size={40} color="grey" />
        </div>
        <div style={{ flex: 1 }}>
          <Row>
            <Col sm={6} xs={12}>
              <div className="Cart-txt3">Pay Online</div>
              <div style={{ fontSize: "12px", color: "#6c757d", marginTop: "4px" }}>
                Secured by Paystack • Cards, Bank Transfer, USSD
              </div>
            </Col>
            <Col sm={6} xs={12}>
              <div className="Cart-row" style={{ justifyContent: "flex-end" }}>
                <div style={{ marginRight: 10 }}>
                  <Image src={Visa} height={30 }alt="Visa" />
                </div>
                <div style={{ marginRight: 10 }}>
                  <Image src={Mster} height={ 30} alt="Mastercard"/>
                </div>
                <div style={{ marginRight: 10 }}>
                  <Image src={Diners} height={30 } alt="Diners" />
                </div>
                <div style={{ marginRight: 10 }}>
                  <Image src={Samsu} height={30} alt="Samsung Pay"/>
                </div>
                <div style={{ 
                  background: "#00C9A7", 
                  color: "white", 
                  padding: "4px 8px", 
                  borderRadius: "4px",
                  fontSize: "10px",
                  fontWeight: "bold"
                }}>
                  ₦
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
      <div
        className={`Cart-paymentBox ${
          props?.method === "Cash On Delivery" ? "active" : ""
        }`}
        onClick={() => props?.onChange("Cash On Delivery")}
      >
        <div style={{ marginRight: 20 }}>
          {props?.method === "Cash On Delivery" ? (
            <IoMdRadioButtonOn size={25} />
          ) : (
            <IoIosRadioButtonOff size={25} />
          )}
        </div>
        <div style={{ marginRight: 10 }}>
          <HiOutlineCash size={40} color="grey" />
        </div>
        <div className="Cart-txt3" style={{ flex: 1 }}>
          Cash On Delivery ( COD )
        </div>
      </div>
      <div
        className={`Cart-paymentBox ${
          props?.method === "Pay On Credit" ? "active" : ""
        }`}
        onClick={() => props?.onChange("Pay On Credit")}
      >
        <div style={{ marginRight: 20 }}>
          {props?.method === "Pay On Credit" ? (
            <IoMdRadioButtonOn size={25} />
          ) : (
            <IoIosRadioButtonOff size={25} />
          )}
        </div>
        <div style={{ marginRight: 10 }}>
          <MdPayments size={38} color="grey" />
        </div>
        <div className="Cart-txt3" style={{ flex: 1 }}>
          Pay On Credit
        </div>
      </div>
      {props?.method === "Pay On Credit" ? (
        <div className={`Cart-paymentBox`}>
          <div className="Cart-bankDetails-box">
            <span>
              This Order will be processed only after the Admin approves the
              Credit payment.
            </span>
            <span>The payment will be completed on month end.</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
export default PaymentBox;
