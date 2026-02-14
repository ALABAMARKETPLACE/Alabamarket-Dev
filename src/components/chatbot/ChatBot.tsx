"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button, Input, message, Tooltip, Space, Divider, Empty } from "antd";
import {
  SendOutlined,
  CloseOutlined,
  CopyOutlined,
  DeleteOutlined,
  MinusOutlined,
  CustomerServiceOutlined,
  GiftOutlined,
  ShoppingOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import "./chatbot.scss";

// Storage keys for chat persistence
const CHATBOT_NAME = "Ifechukwu";
const CHATBOT_AVATAR = "/images/ifechukwu-avatar.png";
const FALLBACK_AVATAR = "/images/ifechukwu-avatar.svg";
const CHAT_STORAGE_KEY = "ifechukwu_chat_messages";
const CHAT_TIMESTAMP_KEY = "ifechukwu_chat_timestamp";
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

// Support contact information
const SUPPORT_CONTACT = {
  phone: "+234 911 735 6897",
  email: "info@alabamarketplace.ng",
};

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  timestamp: Date;
}

// Quick action suggestions
const quickActions = [
  {
    icon: <ShoppingOutlined />,
    label: "Track Order",
    query: "How can I track my order?",
    isSupport: false,
  },
  {
    icon: <GiftOutlined />,
    label: "Deals",
    query: "What are today's best deals?",
    isSupport: false,
  },
  {
    icon: <CustomerServiceOutlined />,
    label: "Support",
    query: "I need to contact support",
    isSupport: true,
  },
  {
    icon: <QuestionCircleOutlined />,
    label: "FAQ",
    query: "What are your shipping options?",
    isSupport: false,
  },
];

// Support response message
const getSupportResponse = () => {
  return `I understand you need assistance! 🤝 Here's how you can reach our support team:

📞 **Call or Chat Support:**
${SUPPORT_CONTACT.phone}

📧 **Email Support:**
${SUPPORT_CONTACT.email}

Our team is available to help you with any questions or concerns. Feel free to reach out through either option!`;
};

// Greeting based on time of day
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

// Helper functions for localStorage persistence
const getInitialGreeting = (): Message => ({
  id: "1",
  type: "bot",
  content: `${getGreeting()}! 👋 I'm ${CHATBOT_NAME}, your personal shopping assistant at Alaba Marketplace. I'm here to help you discover amazing products, track your orders, find the best deals, and answer any questions you have. What would you like to explore today?`,
  timestamp: new Date(),
});

const loadMessagesFromStorage = (): Message[] => {
  if (typeof window === "undefined") return [getInitialGreeting()];

  try {
    const storedTimestamp = localStorage.getItem(CHAT_TIMESTAMP_KEY);
    const storedMessages = localStorage.getItem(CHAT_STORAGE_KEY);

    // Check if messages are older than 24 hours
    if (storedTimestamp) {
      const timestamp = parseInt(storedTimestamp, 10);
      const now = Date.now();
      if (now - timestamp > TWENTY_FOUR_HOURS_MS) {
        // Clear old messages
        localStorage.removeItem(CHAT_STORAGE_KEY);
        localStorage.removeItem(CHAT_TIMESTAMP_KEY);
        return [getInitialGreeting()];
      }
    }

    if (storedMessages) {
      const parsed = JSON.parse(storedMessages);
      // Convert timestamp strings back to Date objects
      return parsed.map((msg: Message & { timestamp: string }) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    }
  } catch (error) {
    console.error("Error loading chat messages from storage:", error);
  }

  return [getInitialGreeting()];
};

const saveMessagesToStorage = (messages: Message[]) => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    // Only set timestamp if it doesn't exist (first message)
    if (!localStorage.getItem(CHAT_TIMESTAMP_KEY)) {
      localStorage.setItem(CHAT_TIMESTAMP_KEY, Date.now().toString());
    }
  } catch (error) {
    console.error("Error saving chat messages to storage:", error);
  }
};

const clearMessagesFromStorage = () => {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(CHAT_STORAGE_KEY);
    localStorage.removeItem(CHAT_TIMESTAMP_KEY);
  } catch (error) {
    console.error("Error clearing chat messages from storage:", error);
  }
};

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([getInitialGreeting()]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState<string>(CHATBOT_AVATAR);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    const loadedMessages = loadMessagesFromStorage();
    setMessages(loadedMessages);
    setShowQuickActions(loadedMessages.length === 1);
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      saveMessagesToStorage(messages);
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue("");
    setShowQuickActions(false);
    setLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentInput,
          conversationHistory: messages.map((m) => ({
            role: m.type === "user" ? "user" : "assistant",
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      message.error(`Oops! ${CHATBOT_NAME} couldn't respond. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    message.success("Copied to clipboard!");
  };

  const clearChat = () => {
    clearMessagesFromStorage();
    setMessages([
      {
        id: "1",
        type: "bot",
        content: `${getGreeting()}! 👋 Welcome back! I'm ${CHATBOT_NAME}, ready to help you with anything. What can I do for you today?`,
        timestamp: new Date(),
      },
    ]);
    setShowQuickActions(true);
  };

  const handleQuickAction = (query: string, isSupport: boolean = false) => {
    setInputValue(query);
    setShowQuickActions(false);
    // Auto-send after a brief delay
    setTimeout(() => {
      const userMessage: Message = {
        id: Date.now().toString(),
        type: "user",
        content: query,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setInputValue("");

      // Handle support action locally without API call
      if (isSupport) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content: getSupportResponse(),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        handleBotResponse(query);
      }
    }, 100);
  };

  const handleBotResponse = async (userQuery: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userQuery,
          conversationHistory: messages.map((m) => ({
            role: m.type === "user" ? "user" : "assistant",
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      message.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Tooltip title={`Chat with ${CHATBOT_NAME}`}>
        <button
          className="chatbot-floating-button"
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
          suppressHydrationWarning
        >
          <span className="chat-avatar">
            <img
              src={avatarSrc}
              alt={CHATBOT_NAME}
              width={28}
              height={28}
              onError={(e) => {
                setAvatarSrc(FALLBACK_AVATAR);
              }}
            />
            <span aria-hidden>👩🏽‍💼</span>
          </span>
          <span className="chat-text">Ask {CHATBOT_NAME}</span>
          <span className="chat-pulse"></span>
        </button>
      </Tooltip>
    );
  }

  return (
    <div className={`chatbot-container ${isMinimized ? "minimized" : ""}`}>
      <div className="chatbot-header">
        <div className="chatbot-header-content">
          <div className="amaka-avatar">
            <img
              src={avatarSrc}
              alt={CHATBOT_NAME}
              width={28}
              height={28}
              onError={(e) => {
                setAvatarSrc(FALLBACK_AVATAR);
              }}
            />
            <span aria-hidden>👩🏽‍💼</span>
            <span className="online-indicator"></span>
          </div>
          <div>
            <h3 className="chatbot-title">{CHATBOT_NAME}</h3>
            <p className="chatbot-subtitle">Your Shopping Assistant • Online</p>
          </div>
        </div>
        <Space size={8}>
          <Tooltip title={isMinimized ? "Expand" : "Minimize"}>
            <Button
              type="text"
              size="small"
              icon={<MinusOutlined />}
              onClick={() => setIsMinimized(!isMinimized)}
              style={{ color: "#fff" }}
            />
          </Tooltip>
          <Tooltip title="Close">
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={() => setIsOpen(false)}
              style={{ color: "#fff" }}
            />
          </Tooltip>
        </Space>
      </div>

      {!isMinimized && (
        <>
          <div className="chatbot-messages">
            {messages.length === 0 ? (
              <Empty
                description="Start a conversation"
                style={{ marginTop: "40px" }}
              />
            ) : (
              <>
                    {messages.map((msg) => (
                  <div key={msg.id} className={`message message-${msg.type}`}>
                    {msg.type === "bot" && (
                      <div className="message-avatar">
                        <img
                          src={avatarSrc}
                          alt={CHATBOT_NAME}
                          width={24}
                          height={24}
                          onError={(e) => {
                            setAvatarSrc(FALLBACK_AVATAR);
                          }}
                        />
                        <span aria-hidden>👩🏽‍💼</span>
                      </div>
                    )}
                    <div className="message-bubble">
                      <div className="message-content">{msg.content}</div>
                      <div className="message-footer">
                        <span className="message-time">
                          {msg.timestamp.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {msg.type === "bot" && (
                          <Tooltip title="Copy">
                            <Button
                              type="text"
                              size="small"
                              icon={<CopyOutlined />}
                              onClick={() => copyMessage(msg.content)}
                              className="copy-btn"
                            />
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Quick Actions */}
                {showQuickActions && messages.length === 1 && !loading && (
                  <div className="quick-actions">
                    <p className="quick-actions-title">Quick Actions:</p>
                    <div className="quick-actions-grid">
                      {quickActions.map((action, index) => (
                        <button
                          key={index}
                          className="quick-action-btn"
                          onClick={() =>
                            handleQuickAction(action.query, action.isSupport)
                          }
                        >
                          {action.icon}
                          <span>{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
            {loading && (
              <div className="message message-bot">
                <div className="message-avatar">
                  <img
                    src={avatarSrc}
                    alt={CHATBOT_NAME}
                    width={24}
                    height={24}
                    onError={(e) => {
                      setAvatarSrc(FALLBACK_AVATAR);
                    }}
                  />
                  <span aria-hidden>👩🏽‍💼</span>
                </div>
                <div className="message-bubble loading-bubble">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="typing-text">{CHATBOT_NAME} is typing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <Divider style={{ margin: "8px 0" }} />

          <div className="chatbot-input-area">
            <Input.TextArea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Amaka anything..."
              disabled={loading}
              autoSize={{ minRows: 1, maxRows: 3 }}
              className="chatbot-input"
              bordered={false}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={sendMessage}
              loading={loading}
              disabled={!inputValue.trim() || loading}
              className="send-button"
            >
              Send
            </Button>
          </div>

          <div className="chatbot-footer">
            <span className="footer-branding">
              Powered by Taskgoglobal Limited ✨
            </span>
            <Tooltip title="Start new conversation">
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                onClick={clearChat}
                className="clear-button"
              >
                New Chat
              </Button>
            </Tooltip>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBot;
