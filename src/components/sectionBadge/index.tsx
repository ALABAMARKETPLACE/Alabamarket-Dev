import React from "react";
import "./style.scss";

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

  return (
    <div className={`section-badge badge-${type} ${className}`}>
      <span className="badge-text">{text || getDefaultText()}</span>
    </div>
  );
};

export default SectionBadge;
