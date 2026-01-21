import React from "react";

export const PlatinumIcon = ({ className }: { className?: string }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="platGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E0EAFC" />
        <stop offset="50%" stopColor="#CFDEF3" />
        <stop offset="100%" stopColor="#B8C6DB" />
      </linearGradient>
      <linearGradient id="platBorder" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fff" />
        <stop offset="100%" stopColor="#899bb5" />
      </linearGradient>
      <filter id="platShadow" x="-2" y="-2" width="28" height="28">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.2" />
      </filter>
    </defs>
    <path
      d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z"
      fill="url(#platGradient)"
      stroke="url(#platBorder)"
      strokeWidth="1.5"
      filter="url(#platShadow)"
    />
    <path
      d="M12 6L13.5 9.5H17L14 11.5L15 15L12 13L9 15L10 11.5L7 9.5H10.5L12 6Z"
      fill="#fff"
      fillOpacity="0.8"
    />
  </svg>
);

export const GoldIcon = ({ className }: { className?: string }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="50%" stopColor="#FDB931" />
        <stop offset="100%" stopColor="#DAA520" />
      </linearGradient>
      <linearGradient id="goldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFF8DC" />
        <stop offset="100%" stopColor="#B8860B" />
      </linearGradient>
      <filter id="goldShadow" x="-2" y="-2" width="28" height="28">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.2" />
      </filter>
    </defs>
    <circle cx="12" cy="12" r="10" fill="url(#goldGradient)" stroke="url(#goldBorder)" strokeWidth="1.5" filter="url(#goldShadow)" />
    <path
      d="M12 7L13.5 10.5H17L14.2 12.8L15.3 16.5L12 14.2L8.7 16.5L9.8 12.8L7 10.5H10.5L12 7Z"
      fill="#FFF"
      fillOpacity="0.9"
    />
    <path
      d="M5 12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12"
      stroke="#B8860B"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.6"
    />
  </svg>
);

export const SilverIcon = ({ className }: { className?: string }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="silverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F5F7FA" />
        <stop offset="100%" stopColor="#B8C6DB" />
      </linearGradient>
      <filter id="silverShadow" x="-2" y="-2" width="28" height="28">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.15" />
      </filter>
    </defs>
    <rect
      x="2"
      y="2"
      width="20"
      height="20"
      rx="6"
      fill="url(#silverGradient)"
      stroke="#D7D7D7"
      strokeWidth="1"
      filter="url(#silverShadow)"
    />
    <path
      d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"
      fill="#7F8C8D"
    />
  </svg>
);

export const DiscountIcon = ({ className }: { className?: string }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="discountGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FF6B6B" />
        <stop offset="100%" stopColor="#EE5253" />
      </linearGradient>
      <filter id="discountShadow" x="-2" y="-2" width="28" height="28">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.2" />
      </filter>
    </defs>
    <path
      d="M21.41 11.58L12.41 2.58C12.05 2.22 11.55 2 11 2H4C2.9 2 2 2.9 2 4V11C2 11.55 2.22 12.05 2.59 12.41L11.59 21.42C11.95 21.79 12.45 22 13 22C13.55 22 14.05 21.79 14.41 21.41L21.41 14.41C21.78 14.05 21.99 13.55 21.99 13C21.99 12.45 21.78 11.95 21.41 11.58ZM5.5 7C4.67 7 4 6.33 4 5.5C4 4.67 4.67 4 5.5 4C6.33 4 7 4.67 7 5.5C7 6.33 6.33 7 5.5 7Z"
      fill="url(#discountGradient)"
      filter="url(#discountShadow)"
    />
    <path
      d="M13 15.5H16M14.5 14V17"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
