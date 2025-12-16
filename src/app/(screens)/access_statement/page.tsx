import CONFIG from "@/config/configuration";
import { Metadata } from "next";
import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import { Breadcrumb } from "antd";
import Link from "next/link";

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: "Accessibility Statement",
    description: `Accessibility Statement for AlabaMarketplace.ng - Our commitment to ensuring digital accessibility for all users, including people with disabilities.`,
  };
};

function AccessibilityStatement() {
  return (
    <div className="page-Box">
      <Container>
        <Breadcrumb
          items={[
            {
              title: <Link href="/">Home</Link>,
            },
            {
              title: "Accessibility Statement",
            },
          ]}
        />
        <br />
        <h1 className="page-text1">Accessibility Statement</h1>
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
              At AlabaMarketplace.ng, we are committed to ensuring that our website, mobile applications, and all online services are accessible to everyone — including people with disabilities. We believe that every user should be able to shop, sell, and communicate with ease, regardless of ability, device, or circumstance.
            </p>
            <br />

            <h4 className="page-text2">1. Our Commitment</h4>
            <p className="page-text3">
              AlabaMarketplace.ng strives to provide a digital experience that meets the accessibility requirements defined by the Web Content Accessibility Guidelines (WCAG) 2.1, Level AA, as published by the World Wide Web Consortium (W3C). Our goal is to make our marketplace inclusive, user-friendly, and compatible with assistive technologies such as:
            </p>
            <ul className="page-text3">
              <li>Screen readers (e.g., NVDA, JAWS, VoiceOver)</li>
              <li>Speech recognition software</li>
              <li>Keyboard-only navigation</li>
              <li>Screen magnifiers and text-resizing tools</li>
              <li>High-contrast and color adjustment settings</li>
            </ul>
            <br />

            <h4 className="page-text2">2. Accessibility Features</h4>
            <p className="page-text3">
              We have implemented various accessibility features across our platform, including:
            </p>
            <ul className="page-text3">
              <li>Alternative text (alt text) for product images and icons</li>
              <li>Clear navigation menus with keyboard support</li>
              <li>Readable fonts and scalable text for easier visibility</li>
              <li>Consistent layouts to aid comprehension and usability</li>
              <li>Labels for input fields and forms for better screen reader interpretation</li>
              <li>Adjustable contrast settings for users with visual impairments</li>
              <li>Video captions and transcripts (where applicable)</li>
            </ul>
            <br />

            <h4 className="page-text2">3. Ongoing Efforts</h4>
            <p className="page-text3">
              Accessibility is an ongoing process. We regularly review and update our platform to ensure continuous compliance and improvement. Our development team collaborates with accessibility consultants and testers to identify and correct issues as new features are added.
            </p>
            <br />

            <h4 className="page-text2">4. Known Limitations</h4>
            <p className="page-text3">
              While we aim for full accessibility, some older or third-party content (such as external payment gateways, ads, or embedded videos) may not yet meet all accessibility standards. We are working with these partners to improve compatibility and welcome user feedback to help identify problem areas.
            </p>
            <br />

            <h4 className="page-text2">5. Feedback and Assistance</h4>
            <p className="page-text3">
              We welcome your feedback on the accessibility of AlabaMarketplace.ng. If you encounter any barriers, difficulties, or have suggestions to improve accessibility, please contact our Accessibility Team:
            </p>
            <p className="page-text3">
              📧 accessibility@alabamarketplace.ng
            </p>
            <br />

            <h4 className="page-text2">6. Supported Browsers and Devices</h4>
            <p className="page-text3">
              Our platform is designed to work with:
            </p>
            <ul className="page-text3">
              <li><strong>Desktop Browsers:</strong> Chrome, Firefox, Safari, Microsoft Edge</li>
              <li><strong>Mobile Devices:</strong> Android and iOS</li>
              <li><strong>Assistive Tools:</strong> Screen readers, voice input, and magnifiers</li>
            </ul>
            <p className="page-text3">
              We recommend using the latest versions of browsers for optimal accessibility and security.
            </p>
            <br />

            <h4 className="page-text2">7. Continuous Improvement</h4>
            <p className="page-text3">
              At Alaba Marketplace, accessibility and inclusion are part of our core values. We are committed to continuous improvement through:
            </p>
            <ul className="page-text3">
              <li>Regular staff training on inclusive design and accessibility standards</li>
              <li>User testing with people of varying abilities</li>
              <li>Ongoing technology updates to remove barriers and enhance usability</li>
            </ul>
            <br />

            <h4 className="page-text2">8. Accessibility Compliance Status</h4>
            <p className="page-text3">
              We are actively working to achieve WCAG 2.1 Level AA compliance. While most areas of our site already meet this standard, we are constantly refining our systems to provide equal access for all users.
            </p>
            <br />

            <h4 className="page-text2">9. Alternative Access Options</h4>
            <p className="page-text3">
              If you are unable to access any part of our website, you may contact our customer service representatives to place an order, request support, or make inquiries through:
            </p>
            <ul className="page-text3">
              <li><strong>Phone:</strong> +234 9117356897</li>
              <li><strong>Email:</strong> info@taxgoglobal.com</li>
            </ul>
            <br />

            <h4 className="page-text2">10. Date of Last Review</h4>
            <p className="page-text3">
              This Accessibility Statement was last reviewed on 28/10/2025 and will be updated regularly to reflect progress and improvements.
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

export default AccessibilityStatement;