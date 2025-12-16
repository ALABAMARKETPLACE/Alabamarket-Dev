import React from "react";
import { Col, Container } from "react-bootstrap";
import CONFIG from "@/config/configuration";
import { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb, Row } from "antd";

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: "Cookies Policy",
    description: `Cookies Policy for AlabaMarketplace.ng - Learn how we use cookies and similar technologies to improve your experience on our platform.`,
  };
};

function CookiesPolicy() {
  return (
    <div className="page-Box">
      <Container>
        <Breadcrumb
          items={[
            {
              title: <Link href="/">Home</Link>,
            },
            {
              title: "Cookies Policy",
            },
          ]}
        />

        <br />
        <h1 className="page-text1">Cookies Policy</h1>
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
              This Cookies Policy explains how AlabaMarketplace.ng ("we," "our," "us") uses cookies and similar technologies to recognize you when you visit our website, mobile application, or related online services (collectively, the "Platform"). It also explains what these technologies are, why we use them, and your rights to control their use.
            </p>
            <p className="page-text3">
              By continuing to browse or use our Platform, you consent to the use of cookies as described in this policy.
            </p>
            <br />

            <h4 className="page-text2">1. What Are Cookies?</h4>
            <p className="page-text3">
              Cookies are small text files that are placed on your computer, smartphone, or other device when you visit a website. They help us make your experience more efficient by remembering your preferences, analyzing how the site is used, and improving our services.
            </p>
            <p className="page-text3">
              Cookies may be:
            </p>
            <ul className="page-text3">
              <li><strong>Session Cookies</strong> – deleted automatically when you close your browser.</li>
              <li><strong>Persistent Cookies</strong> – remain on your device for a set period or until manually deleted.</li>
              <li><strong>First-Party Cookies</strong> – set by AlabaMarketplace.ng.</li>
              <li><strong>Third-Party Cookies</strong> – set by external services we use (e.g., Google Analytics, Facebook Pixel, or Paystack).</li>
            </ul>
            <br />

            <h4 className="page-text2">2. How We Use Cookies</h4>
            <p className="page-text3">
              We use cookies for the following purposes:
            </p>

            <h5 className="page-text2">a. Essential Cookies</h5>
            <p className="page-text3">
              These are necessary for our Platform to function properly. They allow you to log in, manage your cart, make secure payments, and access protected areas.
            </p>
            <ul className="page-text3">
              <li><strong>Example:</strong> session management, authentication, and account security cookies.</li>
            </ul>

            <h5 className="page-text2">b. Performance and Analytics Cookies</h5>
            <p className="page-text3">
              These cookies help us understand how visitors interact with our site, which pages are most popular, and where users encounter issues.
            </p>
            <ul className="page-text3">
              <li><strong>Example:</strong> Google Analytics cookies that track traffic sources, bounce rates, and user activity.</li>
            </ul>

            <h5 className="page-text2">c. Functionality Cookies</h5>
            <p className="page-text3">
              These cookies allow us to remember your preferences — such as language, location, or display settings — to enhance your browsing experience.
            </p>

            <h5 className="page-text2">d. Advertising and Marketing Cookies</h5>
            <p className="page-text3">
              These cookies are used to deliver personalized advertisements and measure the effectiveness of our marketing campaigns. They may be set by us or by third-party ad networks such as Meta (Facebook/Instagram) or Google Ads.
            </p>

            <h5 className="page-text2">e. Social Media Cookies</h5>
            <p className="page-text3">
              These cookies enable users to share content directly from our platform to their social media accounts or use embedded media (like videos or social share buttons).
            </p>
            <br />

            <h4 className="page-text2">3. Third-Party Cookies</h4>
            <p className="page-text3">
              We may allow trusted third parties to place cookies on your device for:
            </p>
            <ul className="page-text3">
              <li>Website analytics (Google Analytics, Meta Pixel)</li>
              <li>Payment processing (Paystack, Flutterwave)</li>
              <li>Chat support or customer engagement tools</li>
            </ul>
            <p className="page-text3">
              Each third party is responsible for its own privacy and cookie practices. You can review their individual policies on their websites.
            </p>
            <br />

            <h4 className="page-text2">4. Managing Cookies and Your Choices</h4>
            <p className="page-text3">
              You can control and manage cookies through your browser settings. Most browsers allow you to:
            </p>
            <ul className="page-text3">
              <li>View which cookies are stored on your device</li>
              <li>Delete cookies automatically or manually</li>
              <li>Block certain types of cookies</li>
              <li>Receive alerts before a cookie is stored</li>
            </ul>
            <p className="page-text3">
              Please note that disabling certain cookies may impact your ability to use some features on AlabaMarketplace.ng, such as shopping carts, login sessions, or payment processing.
            </p>
            <p className="page-text3">
              <strong>Browser Management Links:</strong>
            </p>
            <ul className="page-text3">
              <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Google Chrome</a></li>
              <li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener noreferrer">Mozilla Firefox</a></li>
              <li><a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
              <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer">Microsoft Edge</a></li>
            </ul>
            <br />

            <h4 className="page-text2">5. Consent to Cookies</h4>
            <p className="page-text3">
              When you first visit AlabaMarketplace.ng, a cookie banner will appear asking you to accept or manage your cookie preferences. By clicking "Accept," you consent to the use of cookies as outlined in this policy.
            </p>
            <p className="page-text3">
              You may withdraw or change your consent at any time through our cookie management tool or your browser settings.
            </p>
            <br />

            <h4 className="page-text2">6. Changes to This Policy</h4>
            <p className="page-text3">
              We may update this Cookies Policy periodically to reflect changes in technology, legal requirements, or our practices. The "Last Updated" date at the top of this page indicates the most recent revision.
            </p>
            <br />

            <h4 className="page-text2">7. Contact Us</h4>
            <p className="page-text3">
              If you have questions about this Cookies Policy or how cookies are used on our Platform, please contact:
            </p>
            <p className="page-text3">
              <strong>Alaba Marketplace Data Protection Office</strong><br />
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

export default CookiesPolicy;