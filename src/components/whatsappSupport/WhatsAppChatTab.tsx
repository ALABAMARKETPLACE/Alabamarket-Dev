"use client";

import React, { useEffect, useMemo, useState } from "react";
import { MdWhatsapp } from "react-icons/md";
import { usePathname } from "next/navigation";
import styles from "./style.module.scss";
import CONFIG from "@/config/configuration";

function normalizeWhatsAppNumber(input: string) {
  const digitsOnly = input.replace(/[^\d]/g, "");
  return digitsOnly.startsWith("0") ? digitsOnly.replace(/^0+/, "") : digitsOnly;
}

export default function WhatsAppChatTab() {
  const pathname = usePathname();
  const [pageUrl, setPageUrl] = useState<string>("");

  useEffect(() => {
    setPageUrl(window.location.href);
  }, [pathname]);

  const whatsappNumber = useMemo(() => {
    const raw =
      process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_NUMBER ?? CONFIG.CONTACT_NUMBER;
    return normalizeWhatsAppNumber(raw ?? "");
  }, []);

  const message = useMemo(() => {
    const base = `Hi Support, I need help with ${CONFIG.NAME}.`;
    return pageUrl ? `${base} Page: ${pageUrl}` : base;
  }, [pageUrl]);

  const href = useMemo(() => {
    if (!whatsappNumber) return "";
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  }, [message, whatsappNumber]);

  const hidden = pathname?.startsWith("/auth");

  if (!href || hidden) return null;

  return (
    <div className={styles.container}>
      <a
        className={styles.tab}
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with support on WhatsApp"
      >
        <span className={styles.iconWrap} aria-hidden="true">
          <MdWhatsapp size={18} />
        </span>
        <span className={styles.label}>Chat with Support</span>
      </a>
    </div>
  );
}
