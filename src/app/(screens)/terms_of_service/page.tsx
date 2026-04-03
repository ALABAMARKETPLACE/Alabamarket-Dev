import React from "react";
import { Metadata } from "next";
import PolicyPageLayout from "@/components/policyPageLayout";

export const generateMetadata = async (): Promise<Metadata> => {
  return {
    title: "Terms of Service",
    description: `Terms of Service for AlabaMarketplace.ng - Online marketplace connecting verified sellers with buyers across Nigeria and beyond.`,
  };
};

function TermsService() {
  return (
    <PolicyPageLayout
      title="Terms of Service"
      currentPath="/terms_of_service"
      updatedDate="28/10/2025"
    >
      <p className="page-text3">
        Welcome to AlabaMarketplace.ng ("Alaba Marketplace," "we," "our," or "us").
        These Terms of Service ("Terms") govern your access to and use of our website,
        mobile application, and related services (collectively, the "Platform").
      </p>
      <p className="page-text3">
        By using our Platform, you agree to these Terms. If you do not agree, please
        discontinue use immediately.
      </p>

      <h4 className="page-text1">1. Overview of the Platform</h4>
      <p className="page-text3">
        AlabaMarketplace.ng is an online marketplace that connects verified sellers
        (primarily from the Alaba International Market and similar trading communities)
        with buyers across Nigeria and beyond. We provide the infrastructure for online
        sales, marketing, logistics integration, and secure payment processing — but we
        do not directly own or sell the products listed by independent merchants.
      </p>

      <h4 className="page-text1">2. Eligibility</h4>
      <p className="page-text3">To use our services, you must:</p>
      <ul className="page-text3">
        <li>Be at least 18 years old or of legal age in your jurisdiction.</li>
        <li>Provide accurate, complete, and up-to-date information when registering.</li>
        <li>Agree to comply with all applicable Nigerian laws and marketplace rules.</li>
      </ul>
      <p className="page-text3">
        If you use the Platform on behalf of a business, you represent that you have
        the authority to bind that entity to these Terms.
      </p>

      <h4 className="page-text1">3. Account Registration</h4>
      <ul className="page-text3">
        <li>You must create an account to list, buy, or sell on the Platform.</li>
        <li>You are responsible for safeguarding your login credentials and for all activities that occur under your account.</li>
        <li>Alaba Marketplace reserves the right to suspend or terminate accounts that violate these Terms, engage in fraud, or misrepresent identity.</li>
      </ul>

      <h4 className="page-text1">4. Seller Obligations</h4>
      <p className="page-text3">Sellers must:</p>
      <ul className="page-text3">
        <li>List only genuine, lawful, and accurately described products.</li>
        <li>Ensure all prices are displayed in Nigerian Naira (₦) and include applicable taxes or delivery fees.</li>
        <li>Deliver products as advertised and within agreed timelines.</li>
        <li>Honor refund or replacement policies in compliance with consumer protection laws.</li>
      </ul>
      <p className="page-text3">
        Prohibited products include, but are not limited to: counterfeit goods,
        illegal substances, firearms, adult material, and hazardous items.
      </p>

      <h4 className="page-text1">5. Buyer Responsibilities</h4>
      <p className="page-text3">Buyers agree to:</p>
      <ul className="page-text3">
        <li>Provide accurate delivery and payment details.</li>
        <li>Pay for products through approved payment channels.</li>
        <li>Inspect goods upon delivery and report disputes promptly.</li>
        <li>Use the Platform lawfully and refrain from abusive or fraudulent conduct.</li>
      </ul>

      <h4 className="page-text1">6. Payment and Transaction Policy</h4>
      <ul className="page-text3">
        <li>All payments are processed securely through licensed payment providers (e.g., Paystack, Flutterwave).</li>
        <li>Alaba Marketplace may charge transaction or service fees for listings, promotions, or sales.</li>
        <li>Sellers are responsible for any applicable taxes or levies.</li>
        <li>Refunds (where applicable) will follow our Refund &amp; Dispute Resolution Policy.</li>
      </ul>
      <p className="page-text3">
        Alaba Marketplace does not store your card or banking information directly;
        such data is processed securely by third-party gateways.
      </p>

      <h4 className="page-text1">7. Logistics and Delivery</h4>
      <ul className="page-text3">
        <li>Sellers may handle delivery themselves or use approved logistics partners (e.g., Parcel-King, GIG Logistics, DHL, etc.).</li>
        <li>Estimated delivery times are provided for guidance only.</li>
        <li>Alaba Marketplace is not liable for delays, damages, or losses once goods are in the custody of a logistics partner, though we may assist in resolving such disputes.</li>
      </ul>

      <h4 className="page-text1">8. Fees and Commissions</h4>
      <p className="page-text3">Alaba Marketplace may earn commissions from:</p>
      <ul className="page-text3">
        <li>Successful product sales</li>
        <li>Featured listings or promotional campaigns</li>
        <li>Subscription tiers (e.g., Standard, Silver, Gold, Platinum stores)</li>
      </ul>
      <p className="page-text3">
        Any fee structure changes will be communicated in advance through your
        registered email or dashboard notification.
      </p>

      <h4 className="page-text1">9. Prohibited Conduct</h4>
      <p className="page-text3">Users may not:</p>
      <ul className="page-text3">
        <li>Post misleading, false, or defamatory content.</li>
        <li>List counterfeit, stolen, or restricted products.</li>
        <li>Use automated tools (bots or scrapers) to extract data.</li>
        <li>Violate intellectual property rights of others.</li>
        <li>Engage in fraud, money laundering, or illegal financial activities.</li>
      </ul>
      <p className="page-text3">
        Violations may result in account suspension, permanent removal, or legal action.
      </p>

      <h4 className="page-text1">10. Intellectual Property</h4>
      <p className="page-text3">
        All content on the Platform — including logos, graphics, text, and software —
        is owned or licensed by AlabaMarketplace.ng. You may not reproduce, distribute,
        or use any content without prior written consent.
      </p>
      <p className="page-text3">
        However, sellers retain ownership of their trademarks, product photos, and
        descriptions uploaded to their stores.
      </p>

      <h4 className="page-text1">11. Dispute Resolution</h4>
      <p className="page-text3">If a dispute arises between a buyer and seller:</p>
      <ul className="page-text3">
        <li>Parties must first use the Platform's dispute resolution system.</li>
        <li>If unresolved, Alaba Marketplace's Dispute Panel will mediate.</li>
        <li>If still unresolved, the matter shall be referred to arbitration in Lagos State, Nigeria, under the Arbitration and Conciliation Act (Cap A18, LFN 2004).</li>
      </ul>
      <p className="page-text3">The decision of the arbitrator will be final and binding.</p>

      <h4 className="page-text1">12. Limitation of Liability</h4>
      <p className="page-text3">Alaba Marketplace acts as a facilitator, not the actual seller. We are not liable for:</p>
      <ul className="page-text3">
        <li>Product defects, damages, or losses after dispatch.</li>
        <li>Fraudulent activities of third parties.</li>
        <li>Downtime, data loss, or interruptions to the service.</li>
      </ul>
      <p className="page-text3">
        In no event shall our total liability exceed the value of the transaction in question.
      </p>

      <h4 className="page-text1">13. Suspension and Termination</h4>
      <p className="page-text3">We reserve the right to suspend or terminate your account if you:</p>
      <ul className="page-text3">
        <li>Violate these Terms or any policy;</li>
        <li>Engage in fraud or misuse of the platform; or</li>
        <li>Harm the reputation or operations of Alaba Marketplace.</li>
      </ul>
      <p className="page-text3">
        You may terminate your account at any time by written notice to{" "}
        <a href="mailto:support@taxgoglobal.com">support@taxgoglobal.com</a> or{" "}
        <a href="mailto:info@alabamarketplace.ng">info@alabamarketplace.ng</a>
      </p>

      <h4 className="page-text1">14. Privacy</h4>
      <p className="page-text3">
        Your use of the Platform is also governed by our{" "}
        <a href="/privacy-policy">Privacy Policy</a>.
      </p>

      <h4 className="page-text1">15. Modifications to the Terms</h4>
      <p className="page-text3">
        We may modify these Terms periodically. Updates will be posted on this page
        and take effect upon publication. Continued use of the Platform indicates your
        acceptance of the revised Terms.
      </p>

      <h4 className="page-text1">16. Governing Law</h4>
      <p className="page-text3">
        These Terms are governed by the laws of the Federal Republic of Nigeria.
      </p>

      <h4 className="page-text1">17. Contact Information</h4>
      <p className="page-text3">
        For questions, support, or legal notices:{" "}
        <a href="mailto:support@taxgoglobal.com">support@taxgoglobal.com</a>
      </p>
    </PolicyPageLayout>
  );
}

export default TermsService;
