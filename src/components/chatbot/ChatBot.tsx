"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button, Input, message, Tooltip } from "antd";
import {
  SendOutlined,
  CloseOutlined,
  CopyOutlined,
  DeleteOutlined,
  MinusOutlined,
  CustomerServiceOutlined,
} from "@ant-design/icons";
import "./chatbot.scss";

// ─── Constants ────────────────────────────────────────────────────────────────
const CHATBOT_NAME = "Ifechukwu";
const CHATBOT_AVATAR = "/images/ifechukwu-avatar.png";
const CHAT_STORAGE_KEY = "ifechukwu_chat_messages";
const CHAT_TIMESTAMP_KEY = "ifechukwu_chat_timestamp";
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

const SUPPORT_CONTACT = {
  phone: "+234 911 735 6897",
  email: "info@alabamarketplace.ng",
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

// ─── Quick Actions ────────────────────────────────────────────────────────────
const quickActions = [
  { emoji: "📦", label: "Track Order",  desc: "Check delivery status", query: "How can I track my order?",        isSupport: false },
  { emoji: "🎁", label: "Best Deals",   desc: "Today's top offers",    query: "What are today's best deals?",     isSupport: false },
  { emoji: "🎧", label: "Support",      desc: "Talk to our team",      query: "I need to contact support",        isSupport: true  },
  { emoji: "🚚", label: "Shipping",     desc: "Rates & delivery info",  query: "What are your shipping options?", isSupport: false },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const getInitialGreeting = (): Message => ({
  id: "1",
  type: "bot",
  content: `${getGreeting()}! 👋 I'm ${CHATBOT_NAME}, your personal shopping assistant at Alaba Marketplace. I'm here to help you discover amazing products, track your orders, find the best deals, and answer any questions you have. What would you like to explore today?`,
  timestamp: new Date(),
});

const getSupportResponse = () =>
  `I understand you need assistance! 🤝 Here's how you can reach our support team:\n\n📞 **Call or Chat Support:**\n${SUPPORT_CONTACT.phone}\n\n📧 **Email Support:**\n${SUPPORT_CONTACT.email}\n\nOur team is available to help you with any questions or concerns!`;

// ─── Content Renderer ─────────────────────────────────────────────────────────
const processInline = (text: string): React.ReactNode => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  if (parts.length === 1) return text;
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    return part || null;
  });
};

const renderContent = (content: string): React.ReactNode => {
  const lines = content.split("\n");
  const result: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listType: "ul" | "ol" | null = null;

  const flushList = (key: number) => {
    if (!listItems.length) return;
    const Tag = listType === "ol" ? "ol" : "ul";
    result.push(
      <Tag key={`list-${key}`} className="message-list">
        {listItems.map((item, i) => <li key={i}>{processInline(item)}</li>)}
      </Tag>
    );
    listItems = [];
    listType = null;
  };

  lines.forEach((line, i) => {
    const ulMatch = line.match(/^[-•]\s+(.*)/);
    const olMatch = line.match(/^\d+\.\s+(.*)/);
    if (ulMatch) { if (listType === "ol") flushList(i); listType = "ul"; listItems.push(ulMatch[1]); }
    else if (olMatch) { if (listType === "ul") flushList(i); listType = "ol"; listItems.push(olMatch[1]); }
    else {
      flushList(i);
      if (line.trim() === "") {
        if (i > 0 && i < lines.length - 1) result.push(<br key={`br-${i}`} />);
      } else {
        result.push(<p key={`p-${i}`} className="message-para">{processInline(line)}</p>);
      }
    }
  });
  flushList(lines.length);
  return <div className="message-content">{result}</div>;
};

// ─── Storage ──────────────────────────────────────────────────────────────────
const loadMessagesFromStorage = (): Message[] => {
  if (typeof window === "undefined") return [getInitialGreeting()];
  try {
    const ts = localStorage.getItem(CHAT_TIMESTAMP_KEY);
    if (ts && Date.now() - parseInt(ts, 10) > TWENTY_FOUR_HOURS_MS) {
      localStorage.removeItem(CHAT_STORAGE_KEY);
      localStorage.removeItem(CHAT_TIMESTAMP_KEY);
      return [getInitialGreeting()];
    }
    const stored = localStorage.getItem(CHAT_STORAGE_KEY);
    if (stored)
      return JSON.parse(stored).map((m: Message & { timestamp: string }) => ({ ...m, timestamp: new Date(m.timestamp) }));
  } catch {}
  return [getInitialGreeting()];
};

const saveMessagesToStorage = (msgs: Message[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(msgs));
    if (!localStorage.getItem(CHAT_TIMESTAMP_KEY))
      localStorage.setItem(CHAT_TIMESTAMP_KEY, Date.now().toString());
  } catch {}
};

const clearMessagesFromStorage = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CHAT_STORAGE_KEY);
    localStorage.removeItem(CHAT_TIMESTAMP_KEY);
  } catch {}
};

// ─── Component ────────────────────────────────────────────────────────────────
const ChatBot: React.FC = () => {
  const [isOpen,          setIsOpen]          = useState(false);
  const [messages,        setMessages]        = useState<Message[]>([getInitialGreeting()]);
  const [inputValue,      setInputValue]      = useState("");
  const [loading,         setLoading]         = useState(false);
  const [isMinimized,     setIsMinimized]     = useState(false);
  const [showQuickActions,setShowQuickActions]= useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const loaded = loadMessagesFromStorage();
    setMessages(loaded);
    setShowQuickActions(loaded.length === 1);
  }, []);

  useEffect(() => { if (messages.length > 0) saveMessagesToStorage(messages); }, [messages]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => { if (isOpen && !isMinimized) setTimeout(() => inputRef.current?.focus(), 120); }, [isOpen, isMinimized]);

  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    const userMessage: Message = { id: Date.now().toString(), type: "user", content: inputValue.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    const query = inputValue.trim();
    setInputValue("");
    setShowQuickActions(false);
    setLoading(true);
    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query, conversationHistory: messages.map(m => ({ role: m.type === "user" ? "user" : "assistant", content: m.content })) }),
      });
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), type: "bot", content: data.message, timestamp: new Date() }]);
    } catch {
      message.error(`Oops! ${CHATBOT_NAME} couldn't respond. Please try again.`);
    } finally { setLoading(false); }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const copyMessage = (content: string) => { navigator.clipboard.writeText(content); message.success("Copied!"); };

  const clearChat = () => {
    clearMessagesFromStorage();
    setMessages([{ id: "1", type: "bot", content: `${getGreeting()}! 👋 Welcome back! I'm ${CHATBOT_NAME}, ready to help you. What can I do for you today?`, timestamp: new Date() }]);
    setShowQuickActions(true);
  };

  const handleQuickAction = (query: string, isSupport = false) => {
    setShowQuickActions(false);
    const userMessage: Message = { id: Date.now().toString(), type: "user", content: query, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    if (isSupport) {
      setTimeout(() => setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), type: "bot", content: getSupportResponse(), timestamp: new Date() }]), 300);
    } else {
      handleBotResponse(query);
    }
  };

  const handleBotResponse = async (userQuery: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userQuery, conversationHistory: messages.map(m => ({ role: m.type === "user" ? "user" : "assistant", content: m.content })) }),
      });
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), type: "bot", content: data.message, timestamp: new Date() }]);
    } catch {
      message.error("Failed to get response. Please try again.");
    } finally { setLoading(false); }
  };

  // ── Floating Button ──────────────────────────────────────────────────────────
  if (!isOpen) {
    return (
      <button
        className="chatbot-floating-button"
        onClick={() => setIsOpen(true)}
        aria-label="Open chat"
        suppressHydrationWarning
      >
        <span className="chatbot-fab-icon">
          <Image src={CHATBOT_AVATAR} alt={CHATBOT_NAME} width={28} height={28} className="chatbot-avatar-img" />
        </span>
        <span className="chatbot-fab-label">Ask {CHATBOT_NAME}</span>
        <span className="chat-pulse" />
      </button>
    );
  }

  // ── Chat Window ──────────────────────────────────────────────────────────────
  return (
    <div className={`chatbot-container${isMinimized ? " minimized" : ""}`}>

      {/* Header */}
      <div className="chatbot-header">
        <div className="chatbot-header-deco">
          <div className="chatbot-header-circle1" />
          <div className="chatbot-header-circle2" />
          <div className="chatbot-header-circle3" />
        </div>
        <div className="chatbot-header-content">
          <div className="chatbot-bot-avatar">
            <Image src={CHATBOT_AVATAR} alt={CHATBOT_NAME} width={36} height={36} className="chatbot-avatar-img" />
            <span className="online-indicator" />
          </div>
          <div className="chatbot-header-info">
            <h3 className="chatbot-title">{CHATBOT_NAME}</h3>
            <p className="chatbot-subtitle">
              <span className="chatbot-online-dot" />
              Shopping Assistant · Online
            </p>
          </div>
        </div>
        <div className="chatbot-header-actions">
          <Tooltip title={isMinimized ? "Expand" : "Minimize"}>
            <button className="chatbot-icon-btn" onClick={() => setIsMinimized(!isMinimized)}>
              <MinusOutlined />
            </button>
          </Tooltip>
          <Tooltip title="Close">
            <button className="chatbot-icon-btn" onClick={() => setIsOpen(false)}>
              <CloseOutlined />
            </button>
          </Tooltip>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="chatbot-messages">
            <div className="chatbot-date-sep">Today</div>

            {messages.map((msg, index) => {
              const prev = messages[index - 1];
              const isFirstInGroup = !prev || prev.type !== msg.type;
              const isLastInGroup  = !messages[index + 1] || messages[index + 1].type !== msg.type;

              return (
                <div
                  key={msg.id}
                  className={`message message-${msg.type}${isFirstInGroup ? " first-in-group" : ""}${isLastInGroup ? " last-in-group" : ""}`}
                >
                  {msg.type === "bot" ? (
                    isFirstInGroup ? (
                      <div className="message-avatar">
                        <Image src={CHATBOT_AVATAR} alt={CHATBOT_NAME} width={28} height={28} className="chatbot-avatar-img" />
                      </div>
                    ) : (
                      <div className="message-avatar-spacer" />
                    )
                  ) : null}
                  <div className="message-bubble">
                    {renderContent(msg.content)}
                    <div className="message-footer">
                      <span className="message-time">
                        {msg.timestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {msg.type === "bot" && (
                        <Tooltip title="Copy">
                          <button className="copy-btn" onClick={() => copyMessage(msg.content)}>
                            <CopyOutlined />
                          </button>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Quick Actions */}
            {showQuickActions && messages.length === 1 && !loading && (
              <div className="quick-actions">
                <p className="quick-actions-title">How can I help you today?</p>
                <div className="quick-actions-grid">
                  {quickActions.map((action, i) => (
                    <button
                      key={i}
                      className="quick-action-btn"
                      onClick={() => handleQuickAction(action.query, action.isSupport)}
                    >
                      <span className="qa-emoji">{action.emoji}</span>
                      <div className="qa-text">
                        <span className="qa-label">{action.label}</span>
                        <span className="qa-desc">{action.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Typing Indicator */}
            {loading && (
              <div className="message message-bot first-in-group">
                <div className="message-avatar">
                  <CustomerServiceOutlined style={{ fontSize: 16, color: "#ff9500" }} />
                </div>
                <div className="message-bubble loading-bubble">
                  <div className="typing-indicator">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chatbot-input-area">
            <div className="chatbot-input-wrapper">
              <Input.TextArea
                ref={inputRef}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask ${CHATBOT_NAME} anything…`}
                disabled={loading}
                autoSize={{ minRows: 1, maxRows: 4 }}
                className="chatbot-input"
                bordered={false}
              />
              <button
                className={`send-button${inputValue.trim() && !loading ? " active" : ""}`}
                onClick={sendMessage}
                disabled={!inputValue.trim() || loading}
              >
                <SendOutlined />
              </button>
            </div>
            <p className="chatbot-input-hint">Shift + Enter for new line</p>
          </div>

          {/* Footer */}
          <div className="chatbot-footer">
            <span className="footer-branding">Powered by Taxgoglobal ✨</span>
            <Tooltip title="Start new conversation">
              <button className="clear-button" onClick={clearChat}>
                <DeleteOutlined /> New Chat
              </button>
            </Tooltip>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBot;
