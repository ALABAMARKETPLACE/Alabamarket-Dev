import React from "react";
import { Metadata } from "next";
import { Col, Container, Row } from "react-bootstrap";
import CONFIG from "@/config/configuration";
import Link from "next/link";
import { Breadcrumb } from "antd";

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: "Privacy Policy",
    description: `Privacy Policy for AlabaMarketplace.ng - Learn how we collect, use, disclose, and protect your information when you use our online marketplace platform.`,
  };
};

function PrivacyPpolicy() {
  return (
    <div className="page-Box">
      <Container>
        <Breadcrumb
          items={[
            {
              title: <Link href="/">Home</Link>,
            },
            {
              title: "Privacy Policy",
            },
          ]}
        />
        <br />
        <h1 className="page-text1">Privacy Policy</h1>
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
              Welcome to AlabaMarketplace.ng. Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and protect your information when you visit or use our website, mobile app, and related services (collectively, the "Platform").
            </p>
            <p className="page-text3">
              By accessing or using AlabaMarketplace.ng, you agree to this Privacy Policy. If you do not agree, please do not use our services.
            </p>
            <br />

            <h4 className="page-text2">1. Information We Collect</h4>

            <h5 className="page-text2">a. Information You Provide Directly</h5>
            <p className="page-text3">When you register or use our platform, we may collect:</p>
            <ul className="page-text3">
              <li>Full name, username, and contact details (phone number, email, address)</li>
              <li>Business or shop details (business name, category, product listings)</li>
              <li>Payment and billing information (bank account, card details, or payment provider data)</li>
              <li>Communications, reviews, or feedback you share with us</li>
            </ul>

            <h5 className="page-text2">b. Information Collected Automatically</h5>
            <p className="page-text3">When you visit our site, we automatically collect:</p>
            <ul className="page-text3">
              <li>IP address, browser type, device information, and operating system</li>
              <li>Pages you visit, time spent, and referral links</li>
              <li>Cookies and tracking technologies (for analytics, ads, and session management)</li>
            </ul>

            <h5 className="page-text2">c. Information from Third Parties</h5>
            <p className="page-text3">We may receive data from:</p>
            <ul className="page-text3">
              <li>Payment processors (e.g., Paystack, Flutterwave)</li>
              <li>Logistics partners (e.g., Royal Couriers, GIG, Ifex)</li>
              <li>Advertising and analytics providers (e.g., Google Analytics, Meta Pixel)</li>
            </ul>
            <br />

            <h4 className="page-text2">2. How We Use Your Information</h4>
            <p className="page-text3">We use your data to:</p>
            <ul className="page-text3">
              <li>Create and manage your account</li>
              <li>Facilitate buying and selling transactions</li>
              <li>Communicate order updates and promotions</li>
              <li>Improve platform security and performance</li>
              <li>Provide customer support</li>
              <li>Personalize user experience and marketing campaigns</li>
              <li>Comply with legal and regulatory obligations</li>
            </ul>
            <br />

            <h4 className="page-text2">3. How We Share Your Information</h4>
            <p className="page-text3">We may share your information with:</p>
            <ul className="page-text3">
              <li><strong>Service providers:</strong> For hosting, payment processing, or delivery services</li>
              <li><strong>Business partners:</strong> When needed to fulfill orders or joint promotions</li>
              <li><strong>Law enforcement or regulators:</strong> As required by law</li>
              <li><strong>Buyers and sellers:</strong> Limited information necessary for completing transactions</li>
            </ul>
            <p className="page-text3">
              <strong>We do not sell your personal information.</strong>
            </p>
            <br />

            <h4 className="page-text2">4. Cookies and Tracking Technologies</h4>
            <p className="page-text3">We use cookies to:</p>
            <ul className="page-text3">
              <li>Remember your preferences</li>
              <li>Analyze site traffic</li>
              <li>Deliver personalized ads</li>
            </ul>
            <p className="page-text3">
              You can manage or disable cookies in your browser settings, though this may affect site performance.
            </p>
            <br />

            <h4 className="page-text2">5. Data Retention</h4>
            <p className="page-text3">We retain your information only as long as necessary for:</p>
            <ul className="page-text3">
              <li>Legal compliance</li>
              <li>Transaction history</li>
              <li>Platform security and auditing</li>
            </ul>
            <p className="page-text3">
              When no longer needed, your information will be securely deleted or anonymized.
            </p>
            <br />

            <h4 className="page-text2">6. Data Security</h4>
            <p className="page-text3">
              We use industry-standard security measures including SSL encryption, firewalls, and access controls. However, no system is 100% secure; users are encouraged to safeguard their login credentials.
            </p>
            <br />

            <h4 className="page-text2">7. Your Rights</h4>
            <p className="page-text3">
              Under applicable laws (including NDPR and GDPR), you have the right to:
            </p>
            <ul className="page-text3">
              <li>Access your personal information</li>
              <li>Request correction or deletion</li>
              <li>Withdraw consent for data use</li>
              <li>Request data portability</li>
              <li>File a complaint with a data protection authority</li>
            </ul>
            <p className="page-text3">
              You can exercise these rights by contacting info@taxgoglobal.com
            </p>
            <br />

            <h4 className="page-text2">8. Children's Privacy</h4>
            <p className="page-text3">
              Our services are not intended for children under 18. We do not knowingly collect personal information from children. If we become aware of such collection, we will delete the information promptly.
            </p>
            <br />

            <h4 className="page-text2">9. International Data Transfers</h4>
            <p className="page-text3">
              Your information may be transferred to and processed in countries other than Nigeria. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
            </p>
            <br />

            <h4 className="page-text2">10. Changes to This Policy</h4>
            <p className="page-text3">
              We may update this Privacy Policy periodically. Changes will be posted on this page with an updated revision date. Continued use of our Platform after changes indicates acceptance of the revised policy.
            </p>
            <br />

            <h4 className="page-text2">11. Contact Us</h4>
            <p className="page-text3">
              For questions or concerns about this Privacy Policy or your data, please contact:
            </p>
            <p className="page-text3">
              <strong>Email:</strong> info@taxgoglobal.com<br />
              <strong>Email:</strong> support@taxgoglobal.com<br />
              <strong>Platform:</strong> AlabaMarketplace.ng
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

export default PrivacyPpolicy;