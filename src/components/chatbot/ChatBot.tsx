"use client";
import React, { useState, useEffect, useRef } from "react";
import { Button, Input, Spin, Empty } from "antd";
import {
  SendOutlined,
  CloseOutlined,
  MessageOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import "./chatbot.scss";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! 👋 I'm Alaba Assistant. How can I help you today? You can ask me about products, orders, shipping, or anything else!",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.text,
          conversationHistory: messages,
        }),
      });

      const data = await response.json();

      const botMessage: Message = {
        id: Date.now().toString(),
        text:
          data.reply || "I didn't understand that. Could you please rephrase?",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Sorry, I encountered an error. Please try again later.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 7be3989 (Done)
  // Parse message and make phone numbers clickable
  const renderMessageWithLinks = (text: string) => {
    // Pattern to match Nigerian phone numbers and formatted numbers
    const phonePattern = /(\+234\s?\d{3}\s?\d{3}\s?\d{4}|\+234\d{10}|0\d{10})/g;
<<<<<<< HEAD

    const parts = text.split(phonePattern);

    return parts.map((part, index) => {
      if (phonePattern.test(part)) {
        // Remove spaces and format for tel: link
        const cleanNumber = part.replace(/\s/g, "");
        const telNumber = cleanNumber.startsWith("+")
          ? cleanNumber
          : "+234" + cleanNumber.slice(1);

=======
    
    const parts = text.split(phonePattern);
    
    return parts.map((part, index) => {
      if (phonePattern.test(part)) {
        // Remove spaces and format for tel: link
        const cleanNumber = part.replace(/\s/g, '');
        const telNumber = cleanNumber.startsWith('+') 
          ? cleanNumber 
          : '+234' + cleanNumber.slice(1);
        
>>>>>>> 7be3989 (Done)
        return (
          <a
            key={index}
            href={`tel:${telNumber}`}
            className="phone-link"
            title="Click to call"
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

<<<<<<< HEAD
=======
>>>>>>> 2b3b6c8 (Done)
=======
>>>>>>> 7be3989 (Done)
  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          className="chatbot-floating-btn"
          onClick={() => setIsOpen(true)}
          title="Open chat"
        >
          <MessageOutlined style={{ fontSize: "24px" }} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-content">
              <h3>Alaba Assistant</h3>
              <p>Online now</p>
            </div>
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={() => setIsOpen(false)}
              className="chatbot-close-btn"
            />
          </div>

          {/* Messages Container */}
          <div className="chatbot-messages">
            {messages.length === 0 ? (
              <Empty description="No messages" style={{ marginTop: "50px" }} />
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`message message-${msg.sender}`}>
                  <div className="message-content">
<<<<<<< HEAD
<<<<<<< HEAD
                    <p>{renderMessageWithLinks(msg.text)}</p>
=======
                    <p>{msg.text}</p>
>>>>>>> 2b3b6c8 (Done)
=======
                    <p>{renderMessageWithLinks(msg.text)}</p>
>>>>>>> 7be3989 (Done)
                    <span className="message-time">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {msg.sender === "bot" && (
                      <button
                        className="copy-btn"
                        onClick={() => copyToClipboard(msg.text)}
                        title="Copy message"
                      >
                        <CopyOutlined />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="message message-bot">
                <div className="message-content">
                  <Spin size="small" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chatbot-input-area">
            <Input.TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows={2}
              disabled={isLoading}
              className="chatbot-input"
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="chatbot-send-btn"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
