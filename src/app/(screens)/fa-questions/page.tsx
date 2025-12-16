"use client";
import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import { Breadcrumb, Collapse } from "antd";
import Link from "next/link";

const text1 = (
  <ul className="page-text3">
    <li>
      Yes, you can log on to{" "}
      <a href="alabamarketplace.ng "> alabamarketplace.ng </a> and check the
      warranty of the products that you purchased from alabamarketplace.ng
      except marketplace products.
    </li>
    <li>
      You can only view the warranty of the products sold by Alaba Marketplace;
      in case the purchased product is sold by a Marketplace seller, the
      warranty will not show in this application.
    </li>
  </ul>
);
const text2 = (
  <ul className="page-text3">
    <li>
      Yes, you can log on to{" "}
      <a href="alabamarketplace.ng "> alabamarketplace.ng </a>and check the
      warranty details of products you bought from Alaba Marketplace Retail
      stores as well.
    </li>
  </ul>
);

const text3 = (
  <ul className="page-text3">
    <li>
      The mobile number given at the time of purchasing the products is required
      to be entered to check the warranty of the products you purchased.
    </li>
  </ul>
);

const text4 = (
  <ul className="page-text3">
    <li>
      {" "}
      Yes, if the products were purchased using your mobile number, you do not
      need invoice details to see purchased products.
    </li>
    <li>
      If the mobile number was not captured or incorrectly captured on the
      invoice, then the warranty details of the products will not show on the
      application.{" "}
    </li>
  </ul>
);

const text5 = (
  <ul className="page-text3">
    {" "}
    <li>
      You can see all the purchased products on the Warranty Application portal,
      you can also find out how many days of warranty are remaining. Not just
      that, you could also find out if you bought an additional warranty as well
      along with your products.{" "}
    </li>
  </ul>
);
const text6 = (
  <ul className="page-text3">
    <li>
      {" "}
      You don't need to worry if the warranty for the products you purchased is
      incorrect or not shown on the warranty application. For any
      warranty-related issues for carry-in products e.g. (Laptop, tablets,
      Telecom, Small Domestic appliances, etc.) you can always contact the Alaba
      Marketplace store Customer Care and for Major Domestic Appliances or big
      screen TVs, you can call the Alaba Marketplace support center at
      600502034.
    </li>
    <li>
      {" "}
      You can always refer to the{" "}
      <a href="Return, Exchange and Warranty – Alaba Marketplace UAE">
        Return, Exchange and Warranty – Alaba Marketplace UAE
      </a>{" "}
      policy for the warranty terms even if the product is not reflected on the
      application.{" "}
    </li>
  </ul>
);

const text7 = (
  <ul className="page-text3">
    {" "}
    <li>
      {" "}
      You don’t need to contact the store customer care or contact center incase
      the product you purchased is not reflected or is incorrect on the
      application. The warranty details will be automatically updated with the
      application update. Incase it still doesn’t reflect then you can call our
      call center at 600502034.
    </li>
  </ul>
);

const text8 = (
  <ul className="page-text3">
    {" "}
    <li>
      {" "}
      Yes, for the products like Home Appliances or big-screen TVs you can log
      an onsite support ticket explaining the issue. For smaller-sized products
      like Mobiles, tablets, laptops, etc. while you can book a ticket for
      support however you need to bring the device to the customer care center
      or service center located in the Alaba Marketplace stores.{" "}
    </li>
  </ul>
);

const text9 = (
  <ul className="page-text3">
    {" "}
    <li>
      {" "}
      Yes, you can log in to the portal with your registered mobile number and
      check the status of the warranty ticket against the product. Additionally,
      you could also check the Repair History of the product and the number of
      times the product has been repaired in the past.{" "}
    </li>
  </ul>
);

const text10 = (
  <ul className="page-text3">
    {" "}
    <li>
      {" "}
      Not at the moment but this feature will be added soon. But by checking the
      dates of your warranty, You can contact the store or our call center in
      order to purchase an additional warranty on your products.
    </li>
  </ul>
);

const text11 = (
  <ul className="page-text3">
    <li>
      {" "}
      It is possible that the mobile number you are entering was not used at the
      time of purchasing the product. Please contact our customer care team with
      the invoice details for them to help you with the product warranty.
    </li>
  </ul>
);

const text12 = (
  <ul className="page-text3">
    {" "}
    <li>
      {" "}
      Yes, the Warranty Application is available in English as well as Arabic.{" "}
    </li>
  </ul>
);

const items = [
  {
    key: "1",
    label: (
      <h5 className="page-text2">
        Can I check the warranty details of my products online via the Warranty
        Application?
      </h5>
    ),
    children: <p>{text1}</p>,
  },
  {
    key: "2",
    label: (
      <h5 className="page-text2">
        Can I check the warranty details of products I bought from Alaba
        Marketplace Retail stores?
      </h5>
    ),
    children: <p>{text2}</p>,
  },
  {
    key: "3",
    label: (
      <h5 className="page-text2">
        Which mobile number do I need to put for checking the warranty of my
        products?
      </h5>
    ),
    children: <p>{text3}</p>,
  },
  {
    key: "4",
    label: (
      <h5 className="page-text2">
        I do not have the invoice details with me right now, can I still check
        the details of the products I purchased?
      </h5>
    ),
    children: <p>{text4}</p>,
  },
  {
    key: "5",
    label: (
      <h5 className="page-text2">
        {" "}
        What information can I check from this Warranty Application portal?
      </h5>
    ),
    children: <p>{text5}</p>,
  },
  {
    key: "6",
    label: (
      <h5 className="page-text2">
        What do I need to do if the warranty of the product is incorrect on the
        warranty application?
      </h5>
    ),
    children: <p>{text6}</p>,
  },
  {
    key: "7",
    label: (
      <h5 className="page-text2">
        Do I need to contact the store customer care or Alaba Marketplace
        contact center incase the warranty of the purchased product is incorrect
        or not reflected?
      </h5>
    ),
    children: <p>{text7}</p>,
  },
  {
    key: "8",
    label: (
      <h5 className="page-text2">
        Can I log a warranty claim request for any of my products via this
        application?
      </h5>
    ),
    children: <p>{text8}</p>,
  },
  {
    key: "9",
    label: (
      <h5 className="page-text2">
        Can I see the status of the warranty ticket that I raised via the
        Warranty Application?
      </h5>
    ),
    children: <p>{text9}</p>,
  },
  {
    key: "10",
    label: (
      <h5 className="page-text2">
        Can I purchase an additional warranty for any of my products via the
        Warranty Application?
      </h5>
    ),
    children: <p>{text10}</p>,
  },
  {
    key: "11",
    label: (
      <h5 className="page-text2">
        I am unable to log in using the mobile number, it says user not found,
        what shall I do?
      </h5>
    ),
    children: <p>{text11}</p>,
  },
  {
    key: "12",
    label: (
      <h5 className="page-text2">
        Is the Warranty Application available in other languages?
      </h5>
    ),
    children: <p>{text12}</p>,
  },
];

const App = () => <Collapse accordion items={items} />;

function FaQuestions() {
  return (
    <div className="page-Box">
      <Container>
        <Row>
          <Col sm={8} xs={12}>
            <Breadcrumb
              items={[
                {
                  title: <Link href="/">Home</Link>,
                },
                {
                  title: "Frequently asked Questions",
                },
              ]}
            />

            <br />
            <h1 className="page-text1">Frequently Asked Questions</h1>
            <br />
            <App />
          </Col>
          <Col sm={1} xs={12}></Col>
          <Col sm={3} xs={12}>
            <div className="page-stickeyBox">
              <div className="Footer-text2">
                <Link href="privacy-policy">Privacy and Policy</Link>
              </div>
              <hr />
              <div className="Footer-text2">
                <Link href="cookies-policy">Cookies Policy</Link>
              </div>
              <hr />
              <div className="Footer-text2">
                <Link href="terms_of_service">Terms of Service</Link>
              </div>
              <hr />
              <div className="Footer-text2">
                <Link href="cancellation_return">Refund Policy</Link>
              </div>
              <hr />
              <div className="Footer-text2">
                <Link href="access_statement">Accessibility Statement</Link>
              </div>
              <hr />
              <div className="Footer-text2">
                <Link href="fa-questions">FAQ,S</Link>
              </div>
              <hr />
              <div className="Footer-text2">
                <Link href="contact_us">Contact</Link>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default FaQuestions;
