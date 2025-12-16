import CONFIG from "@/config/configuration";
import { Metadata } from "next";
import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import { Breadcrumb } from "antd";
import Link from "next/link";

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: "Refund Policy",
    description: `Refund Policy for AlabaMarketplace.ng - Learn about our refund, replacement, and return policies for ensuring customer satisfaction across our marketplace.`,
  };
};

function CancellationReturn() {
  return (
    <div className="page-Box">
      <Container>
        <Breadcrumb
          items={[
            {
              title: <Link href="/">Home</Link>,
            },
            {
              title: "Refund Policy",
            },
          ]}
        />
        <br />
        <h1 className="page-text1">Refund Policy</h1>
        <br />
        <Row>
          <Col sm={8} xs={12}>
            <p className="page-text3">
              <strong>Effective Date: 28/10/2025</strong>
            </p>
            <p className="page-text3">
              <strong>Last Updated: 28/10/2025</strong>
            </p>
            <br />
            <p className="page-text3">
              At AlabaMarketplace.ng, we value customer satisfaction and strive to ensure that every buyer receives quality products from verified sellers. This Refund Policy outlines when and how refunds, replacements, or returns may be processed through our platform.
            </p>
            <p className="page-text3">
              By making a purchase on AlabaMarketplace.ng, you agree to the terms set out in this Refund Policy.
            </p>
            <br />

            <h4 className="page-text2">1. Overview</h4>
            <p className="page-text3">
              AlabaMarketplace.ng acts as an intermediary between buyers and independent sellers. All sellers are required to comply with this Refund Policy, which ensures fairness and trust across the marketplace.
            </p>
            <p className="page-text3">
              Refunds may be issued under the following circumstances:
            </p>
            <ul className="page-text3">
              <li>The item received is defective, damaged, or significantly different from its description.</li>
              <li>The item was not delivered or was delivered to the wrong address.</li>
              <li>The order was cancelled before shipment.</li>
              <li>The seller failed to fulfill the order after confirmed payment.</li>
            </ul>
            <br />

            <h4 className="page-text2">2. Conditions for Refund Eligibility</h4>
            <p className="page-text3">
              To qualify for a refund, buyers must ensure that:
            </p>
            <ul className="page-text3">
              <li>A refund or return request is submitted within 7 days of receiving the item.</li>
              <li>The product remains unused, undamaged, and in its original packaging (unless it was defective upon arrival).</li>
              <li>Proof of purchase (order number, payment confirmation, or invoice) is provided.</li>
              <li>The request is made through the Alaba Marketplace Resolution Centre for proper tracking and mediation.</li>
            </ul>
            <br />

            <h4 className="page-text2">3. Non-Refundable Items</h4>
            <p className="page-text3">
              Certain product categories are not eligible for refund or return unless defective upon receipt. These include:
            </p>
            <ul className="page-text3">
              <li>Perishable goods (food, beverages, etc.)</li>
              <li>Intimate or personal items (e.g., undergarments, cosmetics)</li>
              <li>Digital products, software licenses, or downloadable items</li>
              <li>Customized or made-to-order products</li>
              <li>Clearance, discounted, or "as-is" sale items clearly marked non-refundable</li>
            </ul>
            <br />

            <h4 className="page-text2">4. Refund Process</h4>
            <p className="page-text3">
              Once a valid claim is received:
            </p>
            <ul className="page-text3">
              <li><strong>Investigation:</strong> Our team will contact both buyer and seller for verification and supporting evidence (e.g., photos, delivery confirmation).</li>
              <li><strong>Resolution:</strong>
                <ul>
                  <li>If the claim is approved, the refund will be processed within 7–10 business days.</li>
                  <li>Refunds will be credited using the same payment method used for the purchase (e.g., Paystack, Flutterwave, or bank transfer).</li>
                  <li>If replacement is preferred and available, the seller will ship a new item once the original item is returned.</li>
                </ul>
              </li>
              <li><strong>Dispute Handling:</strong> If the seller contests the claim, AlabaMarketplace.ng will review all information and make a final determination based on platform policies and fairness principles.</li>
            </ul>
            <br />

            <h4 className="page-text2">5. Shipping and Return Costs</h4>
            <ul className="page-text3">
              <li>If the return is due to seller error (wrong, defective, or damaged product), the seller bears the return shipping cost.</li>
              <li>If the buyer changes their mind after receiving a correct product, the buyer bears the return shipping cost (if the seller agrees to accept the return).</li>
            </ul>
            <br />

            <h4 className="page-text2">6. Late or Missing Refunds</h4>
            <p className="page-text3">
              If you haven't received your refund after 10 business days:
            </p>
            <ul className="page-text3">
              <li>First, check your bank account or payment platform again.</li>
              <li>Then contact your bank or payment provider, as there may be processing delays.</li>
              <li>If the issue persists, contact our support team at info@taxgoglobal.com</li>
            </ul>
            <br />

            <h4 className="page-text2">7. Cancellations</h4>
            <ul className="page-text3">
              <li>Orders may be cancelled before shipment for a full refund.</li>
              <li>Once an order has been marked as "shipped," cancellation may no longer be possible and a return request may be required instead.</li>
            </ul>
            <br />

            <h4 className="page-text2">8. Dispute Resolution</h4>
            <p className="page-text3">
              If a refund dispute arises between a buyer and seller:
            </p>
            <ul className="page-text3">
              <li>The issue must first be reported to the Alaba Marketplace Dispute Resolution Centre within 7 days.</li>
              <li>If unresolved, it will be escalated to the Marketplace Arbitration Panel for mediation.</li>
              <li>AlabaMarketplace.ng's decision will be final and binding based on evidence provided.</li>
            </ul>
            <br />

            <h4 className="page-text2">9. Marketplace Protection</h4>
            <p className="page-text3">
              To maintain trust across the platform:
            </p>
            <ul className="page-text3">
              <li>Sellers with repeated refund complaints may face suspension, withholding of funds, or permanent removal.</li>
              <li>Buyers found to misuse the refund system may also have their accounts restricted.</li>
            </ul>
            <br />

            <h4 className="page-text2">10. Contact Information</h4>
            <p className="page-text3">
              For refund-related inquiries, please contact:
            </p>
            <p className="page-text3">
              <strong>Alaba Marketplace Refunds Department</strong><br />
              📧 info@taxgoglobal.com
            </p>
            <br />
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

export default CancellationReturn;