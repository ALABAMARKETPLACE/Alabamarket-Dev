"use client";

import React, { useEffect, useRef, useState } from "react";
import { MdClose, MdSend } from "react-icons/md";
import { BsRobot } from "react-icons/bs";
import { getChatbotResponse } from "./chatbotEngine";
import "./chatbot.scss";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  isKnowledgeBase?: boolean;
}

const RuleBasedChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "🎉 Hello! Welcome to Alaba Marketplace!\n\nI'm your helpful assistant. I can help you with:\n✓ Order tracking & status\n✓ Shipping & delivery info\n✓ Payment & refunds\n✓ Product information\n✓ Account issues\n✓ Seller details\n\nWhat can I help you with today?",
      sender: "bot",
      timestamp: new Date(),
      isKnowledgeBase: true,
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdCounterRef = useRef(0);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    messageIdCounterRef.current += 1;

    // Add user message
    const userMessage: Message = {
      id: `user-${messageIdCounterRef.current}`,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate slight delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Get response from rule-based engine
    const { response, isKnowledgeBase } = getChatbotResponse(inputValue);

    messageIdCounterRef.current += 1;

    const botMessage: Message = {
      id: `bot-${messageIdCounterRef.current}`,
      text: response,
      sender: "bot",
      timestamp: new Date(),
      isKnowledgeBase,
    };

    setMessages((prev) => [...prev, botMessage]);
    setIsTyping(false);
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
    // Trigger send after a small delay to ensure state is updated
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Quick suggestion buttons - Most common questions
  const quickQuestions = [
    "How to track my order?",
    "What's the delivery time?",
    "How do I return an item?",
    "What payment methods?",
    "Shipping costs?",
    "Is this seller verified?",
  ];

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          className="chatbot-floating-btn"
          onClick={() => setIsOpen(true)}
          title="Chat with us"
          aria-label="Open chat"
        >
          <BsRobot size={28} />
          <span className="chatbot-badge">Ask Me!</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-content">
              <div className="chatbot-title-section">
                <BsRobot size={22} />
                <div>
                  <h3>Alaba Assistant</h3>
                  <p className="chatbot-status">Always here to help</p>
                </div>
              </div>
              <button
                className="chatbot-close-btn"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                aria-label="Close chat"
              >
                <MdClose size={22} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="chatbot-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chatbot-message-wrapper chatbot-message-wrapper--${message.sender}`}
              >
                <div className={`chatbot-message chatbot-message--${message.sender}`}>
                  <div className="chatbot-message-bubble">
                    <p className="chatbot-message-text">{message.text}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="chatbot-message-wrapper chatbot-message-wrapper--bot">
                <div className="chatbot-message chatbot-message--bot">
                  <div className="chatbot-message-bubble">
                    <div className="chatbot-typing">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions - Show only initially */}
          {messages.length <= 1 && !isTyping && (
            <div className="chatbot-suggestions">
              <p className="chatbot-suggestions-title">Common Questions:</p>
              <div className="chatbot-suggestions-grid">
                {quickQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    className="chatbot-suggestion-btn"
                    onClick={() => handleQuickQuestion(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="chatbot-input-area">
            <div className="chatbot-input-wrapper">
              <input
                type="text"
                className="chatbot-input"
                placeholder="Type your question..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isTyping}
              />
              <button
                className="chatbot-send-btn"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
                title="Send message (Enter)"
                aria-label="Send message"
              >
                <MdSend size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RuleBasedChatBot;
