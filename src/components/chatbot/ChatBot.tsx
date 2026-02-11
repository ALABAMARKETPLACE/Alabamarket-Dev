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
  },
  {
    icon: <GiftOutlined />,
    label: "Deals",
    query: "What are today's best deals?",
  },
  {
    icon: <CustomerServiceOutlined />,
    label: "Support",
    query: "I need help with a purchase",
  },
  {
    icon: <QuestionCircleOutlined />,
    label: "FAQ",
    query: "What are your shipping options?",
  },
];

// Greeting based on time of day
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content: `${getGreeting()}! 👋 I'm Amaka, your personal shopping assistant at Alaba Marketplace. I'm here to help you discover amazing products, track your orders, find the best deals, and answer any questions you have. What would you like to explore today?`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
      message.error("Oops! Amaka couldn't respond. Please try again.");
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
    setMessages([
      {
        id: "1",
        type: "bot",
        content: `${getGreeting()}! 👋 Welcome back! I'm Amaka, ready to help you with anything. What can I do for you today?`,
        timestamp: new Date(),
      },
    ]);
    setShowQuickActions(true);
  };

  const handleQuickAction = (query: string) => {
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
      handleBotResponse(query);
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
      <Tooltip title="Chat with Amaka">
        <button
          className="chatbot-floating-button"
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
          suppressHydrationWarning
        >
          <span className="chat-avatar">👩🏽‍💼</span>
          <span className="chat-text">Ask Amaka</span>
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
            <span>👩🏽‍💼</span>
            <span className="online-indicator"></span>
          </div>
          <div>
            <h3 className="chatbot-title">Amaka</h3>
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
                      <div className="message-avatar">👩🏽‍💼</div>
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
                          onClick={() => handleQuickAction(action.query)}
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
                <div className="message-avatar">👩🏽‍💼</div>
                <div className="message-bubble loading-bubble">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="typing-text">Amaka is typing...</span>
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
            <span className="footer-branding">Powered by Amaka AI ✨</span>
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
