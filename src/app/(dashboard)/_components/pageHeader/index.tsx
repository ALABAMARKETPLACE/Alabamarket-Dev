"use client";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { IoChevronBackOutline, IoMenu, IoClose } from "react-icons/io5";

interface PageHeaderProps {
  title: string;
  bredcume?: string;
  children?: React.ReactNode;
  onBack?: () => void;
  icon?: React.ReactNode;
}

function PageHeader({ title, bredcume, children, onBack, icon }: PageHeaderProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="dashboard-pageHeader">
      {/* Left Section: Back Button, Icon & Title */}
      <div className="dashboard-pageHeader__left">
        <button
          className="dashboard-pageHeader__back-btn"
          onClick={handleBack}
          aria-label="Go back"
          type="button"
        >
          <IoChevronBackOutline size={20} />
        </button>
        {icon && (
          <div className="dashboard-pageHeader__icon">
            {icon}
          </div>
        )}
        <div className="dashboard-pageHeader__title-group">
          <h1 className="dashboard-pageHeader__title">{title}</h1>
          {bredcume && (
            <p className="dashboard-pageHeader__breadcrumb">{bredcume}</p>
          )}
        </div>
      </div>

      {/* Mobile Menu Toggle */}
      {children && (
        <button
          className="dashboard-pageHeader__mobile-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          type="button"
        >
          {mobileMenuOpen ? <IoClose size={24} /> : <IoMenu size={24} />}
        </button>
      )}

      {/* Right Section: Action Buttons (Desktop & Mobile) */}
      {children && (
        <div
          className={`dashboard-pageHeader__actions ${
            mobileMenuOpen ? "dashboard-pageHeader__actions--open" : ""
          }`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
