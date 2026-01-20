import React from "react";
import "./style.scss";
import { PlatinumIcon, GoldIcon, SilverIcon, DiscountIcon } from "./badgeIcons";

interface SectionBadgeProps {
  type: "platinum" | "gold" | "silver" | "discount";
  text?: string;
  className?: string;
}

const SectionBadge: React.FC<SectionBadgeProps> = ({
  type,
  text,
  className = "",
}) => {
  const getDefaultText = () => {
    switch (type) {
      case "platinum":
        return "Platinum";
      case "gold":
        return "Best Seller";
      case "silver":
        return "Hot Sale";
      case "discount":
        return "Sale";
      default:
        return "";
    }
  };

  const renderIcon = () => {
    switch (type) {
      case "platinum":
        return <PlatinumIcon className="badge-icon" />;
      case "gold":
        return <GoldIcon className="badge-icon" />;
      case "silver":
        return <SilverIcon className="badge-icon" />;
      case "discount":
        return <DiscountIcon className="badge-icon" />;
      default:
        return null;
    }
  };

  return (
    <div className={`section-badge badge-${type} ${className}`}>
      {renderIcon()}
      <span className="badge-text">{text || getDefaultText()}</span>
    </div>
  );
};

export default SectionBadge;
