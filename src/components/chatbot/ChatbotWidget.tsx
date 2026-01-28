"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MdChatBubbleOutline, MdClose, MdSend } from "react-icons/md";
import styles from "./style.module.scss";
import CONFIG from "@/config/configuration";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
};

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const STORAGE_KEY = "alabamarket_chatbot_messages_v1";

export default function ChatbotWidget() {
  const pathname = usePathname();
  const hidden = pathname?.startsWith("/auth");

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const defaultWelcome = useMemo<ChatMessage>(
    () => ({
      id: "welcome",
      role: "assistant",
      content: `Hi! I’m ${CONFIG.NAME} Assistant. How can I help you today?`,
      createdAt: Date.now(),
    }),
    [],
  );

  useEffect(() => {
    if (hidden) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setMessages([defaultWelcome]);
        return;
      }
      const parsed = JSON.parse(raw) as ChatMessage[];
      if (Array.isArray(parsed) && parsed.length) {
        setMessages(parsed);
      } else {
        setMessages([defaultWelcome]);
      }
    } catch {
      setMessages([defaultWelcome]);
    }
  }, [defaultWelcome, hidden]);

  useEffect(() => {
    if (hidden) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
    }
  }, [hidden, messages]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [open, messages, sending]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => window.clearTimeout(t);
  }, [open]);

  const quickActions = useMemo(
    () => [
      { label: "Track my order", text: "I want to track my order." },
      { label: "Delivery & returns", text: "Tell me about delivery and returns." },
      { label: "Become a seller", text: "How do I become a seller on this platform?" },
      { label: "Payments help", text: "I need help with payment / checkout." },
    ],
    [],
  );

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || sending) return;

    const nextUser: ChatMessage = {
      id: createId(),
      role: "user",
      content: trimmed,
      createdAt: Date.now(),
    };

    setDraft("");
    setOpen(true);
    setSending(true);
    setMessages((prev) => [...prev, nextUser]);

    try {
      const recent = [...messages, nextUser]
        .slice(-12)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: recent,
          pageUrl: typeof window !== "undefined" ? window.location.href : "",
        }),
      });

      const data = (await res.json()) as { reply?: string };
      const replyText =
        typeof data?.reply === "string" && data.reply.trim()
          ? data.reply.trim()
          : "Sorry, I couldn’t generate a response. Please try again.";

      const bot: ChatMessage = {
        id: createId(),
        role: "assistant",
        content: replyText,
        createdAt: Date.now(),
      };

      setMessages((prev) => [...prev, bot]);
    } catch {
      const bot: ChatMessage = {
        id: createId(),
        role: "assistant",
        content:
          "Sorry — something went wrong. Please try again or chat with Support via WhatsApp.",
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, bot]);
    } finally {
      setSending(false);
    }
  };

  if (hidden) return null;

  return (
    <div className={styles.container}>
      {open ? (
        <div className={styles.panel} role="dialog" aria-label="Support chat">
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.brandDot} aria-hidden="true" />
              <div className={styles.headerText}>
                <div className={styles.title}>{CONFIG.NAME} Assistant</div>
                <div className={styles.subTitle}>Ask anything — I’ll guide you</div>
              </div>
            </div>
            <button
              type="button"
              className={styles.iconButton}
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <MdClose size={18} />
            </button>
          </div>

          <div className={styles.messages} ref={listRef}>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`${styles.messageRow} ${
                  m.role === "user" ? styles.userRow : styles.botRow
                }`}
              >
                <div
                  className={`${styles.bubble} ${
                    m.role === "user" ? styles.userBubble : styles.botBubble
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {messages.length <= 1 ? (
              <div className={styles.quickRow}>
                {quickActions.map((qa) => (
                  <button
                    key={qa.label}
                    type="button"
                    className={styles.quickChip}
                    onClick={() => sendMessage(qa.text)}
                    disabled={sending}
                  >
                    {qa.label}
                  </button>
                ))}
              </div>
            ) : null}

            {sending ? (
              <div className={`${styles.messageRow} ${styles.botRow}`}>
                <div className={`${styles.bubble} ${styles.botBubble}`}>
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                  <span className={styles.typingDot} />
                </div>
              </div>
            ) : null}
          </div>

          <form
            className={styles.composer}
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(draft);
            }}
          >
            <input
              ref={inputRef}
              value={draft}
              className={styles.input}
              placeholder="Type your message…"
              onChange={(e) => setDraft(e.target.value)}
              disabled={sending}
              aria-label="Message"
            />
            <button
              type="submit"
              className={styles.sendButton}
              disabled={sending || !draft.trim()}
              aria-label="Send"
            >
              <MdSend size={18} />
            </button>
          </form>
        </div>
      ) : (
        <button
          type="button"
          className={styles.fab}
          onClick={() => setOpen(true)}
          aria-label="Open chat"
        >
          <span className={styles.fabIcon} aria-hidden="true">
            <MdChatBubbleOutline size={18} />
          </span>
          <span className={styles.fabLabel}>Chat</span>
        </button>
      )}
    </div>
  );
}
