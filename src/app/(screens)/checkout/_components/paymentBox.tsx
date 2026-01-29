"use client";
import React from "react";
import { Row, Col } from "react-bootstrap";
import { IoCardOutline } from "react-icons/io5";
import { IoCashOutline } from "react-icons/io5";
import { IoIosRadioButtonOff, IoMdRadioButtonOn } from "react-icons/io";

import Visa from "../../../../assets/images/visa.png";
import Mster from "../../../../assets/images/mastercard.png";
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
      <div className={`Cart-paymentBox active`}>
        <div style={{ marginRight: 20 }}>
          <IoMdRadioButtonOn size={25} />
        </div>
        <div style={{ marginRight: 10 }}>
          <IoCardOutline size={40} color="grey" />
        </div>
        <div style={{ flex: 1 }}>
          <Row>
            <Col sm={6} xs={12}>
              <div className="Cart-txt3">Pay Online</div>
              <div
                style={{ fontSize: "12px", color: "#6c757d", marginTop: "4px" }}
              >
                Secured by Paystack • Cards, Bank Transfer, USSD
              </div>
            </Col>
            <Col sm={6} xs={12}>
              <div className="Cart-row" style={{ justifyContent: "flex-end" }}>
                <div style={{ marginRight: 10 }}>
                  <Image src={Visa} height={30} alt="Visa" />
                </div>
                <div style={{ marginRight: 10 }}>
                  <Image src={Mster} height={30} alt="Mastercard" />
                </div>
                <div
                  style={{
                    background: "#00C9A7",
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  ₦
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
}
export default PaymentBox;
