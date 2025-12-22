import React from "react";

const HamburgerIcon = ({ onClick }: { onClick: () => void }) => (
  <button
    aria-label="Open menu"
    style={{
      background: "none",
      border: "none",
      padding: 0,
      marginRight: 12,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      height: 40,
      width: 40,
      justifyContent: "center",
    }}
    onClick={onClick}
  >
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect y="5" width="28" height="3" rx="1.5" fill="#FF5F15" />
      <rect y="12.5" width="28" height="3" rx="1.5" fill="#FF5F15" />
      <rect y="20" width="28" height="3" rx="1.5" fill="#FF5F15" />
    </svg>
  </button>
);

export default HamburgerIcon;
