"use client";
import { useRouter } from "next/navigation";
import React from "react";
import { IoChevronBackOutline } from "react-icons/io5";

interface PageHeaderProps {
  title: string;
  bredcume?: string;
  children?: React.ReactNode;
  onBack?: () => void;
}

function PageHeader({ title, bredcume, children, onBack }: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <div className="dashboard-pageHeader">
      {/* Back Button & Title Section */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            className="dashboard-pageHeaderBox2"
            onClick={handleBack}
            aria-label="Go back"
            type="button"
          >
            <IoChevronBackOutline size={20} />
          </button>
          <div>
            <div className="dashboard-pageHeadertxt1">{title}</div>
            {bredcume && <div className="dashboard-pageHeadertxt2">{bredcume}</div>}
          </div>
        </div>
      </div>

      {/* Action Buttons Section */}
      {children && (
        <div className="dashboard-pageHeaderBox">
          {children}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
