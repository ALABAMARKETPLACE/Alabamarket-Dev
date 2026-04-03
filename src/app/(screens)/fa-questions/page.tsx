"use client";
import React from "react";
import { Collapse } from "antd";
import PolicyPageLayout from "@/components/policyPageLayout";

const text1 = (
  <ul className="page-text3">
    <li>
      Yes, you can log on to{" "}
      <a href="https://alabamarketplace.ng">alabamarketplace.ng</a> and check the
      warranty of the products that you purchased from alabamarketplace.ng
      except marketplace products.
    </li>
    <li>
      You can only view the warranty of the products sold by Alaba Marketplace;
      in case the purchased product is sold by a Marketplace seller, the warranty
      will not show in this application.
    </li>
  </ul>
);

const text2 = (
  <ul className="page-text3">
    <li>
      Yes, you can log on to{" "}
      <a href="https://alabamarketplace.ng">alabamarketplace.ng</a> and check the
      warranty details of products you bought from Alaba Marketplace Retail stores
      as well.
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
      Yes, if the products were purchased using your mobile number, you do not
      need invoice details to see purchased products.
    </li>
    <li>
      If the mobile number was not captured or incorrectly captured on the invoice,
      then the warranty details of the products will not show on the application.
    </li>
  </ul>
);

const text5 = (
  <ul className="page-text3">
    <li>
      You can see all the purchased products on the Warranty Application portal,
      you can also find out how many days of warranty are remaining. Not just that,
      you could also find out if you bought an additional warranty as well along
      with your products.
    </li>
  </ul>
);

const text6 = (
  <ul className="page-text3">
    <li>
      You don't need to worry if the warranty for the products you purchased is
      incorrect or not shown on the warranty application. For any warranty-related
      issues for carry-in products e.g. (Laptop, tablets, Telecom, Small Domestic
      appliances, etc.) you can always contact the Alaba Marketplace store Customer
      Care and for Major Domestic Appliances or big screen TVs, you can call the
      Alaba Marketplace support center at 600502034.
    </li>
    <li>
      You can always refer to the Return, Exchange and Warranty policy for the
      warranty terms even if the product is not reflected on the application.
    </li>
  </ul>
);

const text7 = (
  <ul className="page-text3">
    <li>
      You don't need to contact the store customer care or contact center in case
      the product you purchased is not reflected or is incorrect on the application.
      The warranty details will be automatically updated with the application update.
      In case it still doesn't reflect then you can call our call center at 600502034.
    </li>
  </ul>
);

const text8 = (
  <ul className="page-text3">
    <li>
      Yes, for the products like Home Appliances or big-screen TVs you can log an
      onsite support ticket explaining the issue. For smaller-sized products like
      Mobiles, tablets, laptops, etc. while you can book a ticket for support however
      you need to bring the device to the customer care center or service center
      located in the Alaba Marketplace stores.
    </li>
  </ul>
);

const text9 = (
  <ul className="page-text3">
    <li>
      Yes, you can log in to the portal with your registered mobile number and check
      the status of the warranty ticket against the product. Additionally, you could
      also check the Repair History of the product and the number of times the product
      has been repaired in the past.
    </li>
  </ul>
);

const text10 = (
  <ul className="page-text3">
    <li>
      Not at the moment but this feature will be added soon. But by checking the dates
      of your warranty, you can contact the store or our call center in order to
      purchase an additional warranty on your products.
    </li>
  </ul>
);

const text11 = (
  <ul className="page-text3">
    <li>
      It is possible that the mobile number you are entering was not used at the time
      of purchasing the product. Please contact our customer care team with the invoice
      details for them to help you with the product warranty.
    </li>
  </ul>
);

const text12 = (
  <ul className="page-text3">
    <li>Yes, the Warranty Application is available in English as well as Arabic.</li>
  </ul>
);

const faqItems = [
  {
    key: "1",
    label: "Can I check the warranty details of my products online via the Warranty Application?",
    children: text1,
  },
  {
    key: "2",
    label: "Can I check the warranty details of products I bought from Alaba Marketplace Retail stores?",
    children: text2,
  },
  {
    key: "3",
    label: "Which mobile number do I need to put for checking the warranty of my products?",
    children: text3,
  },
  {
    key: "4",
    label: "I do not have the invoice details with me right now, can I still check the details of the products I purchased?",
    children: text4,
  },
  {
    key: "5",
    label: "What information can I check from this Warranty Application portal?",
    children: text5,
  },
  {
    key: "6",
    label: "What do I need to do if the warranty of the product is incorrect on the warranty application?",
    children: text6,
  },
  {
    key: "7",
    label: "Do I need to contact the store customer care or Alaba Marketplace contact center in case the warranty of the purchased product is incorrect or not reflected?",
    children: text7,
  },
  {
    key: "8",
    label: "Can I log a warranty claim request for any of my products via this application?",
    children: text8,
  },
  {
    key: "9",
    label: "Can I see the status of the warranty ticket that I raised via the Warranty Application?",
    children: text9,
  },
  {
    key: "10",
    label: "Can I purchase an additional warranty for any of my products via the Warranty Application?",
    children: text10,
  },
  {
    key: "11",
    label: "I am unable to log in using the mobile number, it says user not found, what shall I do?",
    children: text11,
  },
  {
    key: "12",
    label: "Is the Warranty Application available in other languages?",
    children: text12,
  },
];

function FaQuestions() {
  return (
    <PolicyPageLayout
      title="Frequently Asked Questions"
      currentPath="/fa-questions"
    >
      <p className="page-text3">
        Find answers to the most common questions about warranties, orders, and
        using the Alaba Marketplace platform.
      </p>
      <Collapse
        accordion
        items={faqItems}
        style={{ background: "transparent", border: "none" }}
      />
    </PolicyPageLayout>
  );
}

export default FaQuestions;
