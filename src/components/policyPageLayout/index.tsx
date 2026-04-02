import React from "react";
import Link from "next/link";
import { Breadcrumb } from "antd";
import { Container } from "react-bootstrap";
import "./style.scss";

const NAV_LINKS = [
  { href: "/privacy-policy",    label: "Privacy Policy" },
  { href: "/cookies-policy",    label: "Cookies Policy" },
  { href: "/terms_of_service",  label: "Terms of Service" },
  { href: "/cancellation_return", label: "Refund Policy" },
  { href: "/access_statement",  label: "Accessibility Statement" },
  { href: "/fa-questions",      label: "FAQs" },
  { href: "/about-us",          label: "About Us" },
  { href: "/contact_us",        label: "Contact" },
];

interface Props {
  title: string;
  currentPath: string;
  updatedDate?: string;
  children: React.ReactNode;
}

function PolicyPageLayout({ title, currentPath, updatedDate, children }: Props) {
  return (
    <div className="page-Box">
      {/* Hero */}
      <div className="policy-hero">
        <Container>
          <Breadcrumb
            className="policy-hero__breadcrumb"
            items={[
              { title: <Link href="/">Home</Link> },
              { title },
            ]}
          />
          <h1 className="policy-hero__title">{title}</h1>
          {updatedDate && (
            <div className="policy-hero__meta">
              <span className="policy-hero__badge">Last updated: {updatedDate}</span>
            </div>
          )}
        </Container>
      </div>

      {/* Body */}
      <Container>
        <div className="row policy-layout">
          {/* Main content */}
          <div className="col-lg-8 col-12">
            <div className="policy-content">
              {children}
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4 col-12">
            <div className="page-stickeyBox">
              <div className="policy-sidebar__heading">Legal & Info</div>
              {NAV_LINKS.map((link) => {
                const isActive = currentPath === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`policy-sidebar__link${isActive ? " policy-sidebar__link--active" : ""}`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="policy-sidebar__contact">
                <div className="policy-sidebar__contact-label">Need Help?</div>
                <div className="policy-sidebar__contact-item">
                  <a href="mailto:info@alabamarketplace.ng">info@alabamarketplace.ng</a>
                </div>
                <div className="policy-sidebar__contact-item">
                  <a href="mailto:support@taxgoglobal.com">support@taxgoglobal.com</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

export default PolicyPageLayout;
