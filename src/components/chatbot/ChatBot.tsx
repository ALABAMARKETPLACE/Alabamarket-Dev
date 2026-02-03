'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Button,
  Input,
  Spin,
  message,
  Tooltip,
  Space,
  Divider,
  Empty,
} from 'antd';
import {
  SendOutlined,
  RobotOutlined,
  CloseOutlined,
  CopyOutlined,
  DeleteOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import './chatbot.scss';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: `Welcome to Alaba Marketplace! 👋 I'm your AI shopping assistant. I'm here to help you find products, track orders, answer questions about shipping, returns, and much more. How can I assist you today?`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          conversationHistory: messages.map((m) => ({
            role: m.type === 'user' ? 'user' : 'assistant',
            content: m.content,
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      message.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    message.success('Copied to clipboard!');
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        type: 'bot',
        content: `Welcome back! 👋 Ready to help you with anything. What can I do for you?`,
        timestamp: new Date(),
      },
    ]);
  };

  if (!isOpen) {
    return (
      <Tooltip title="Chat with us">
        <button
          className="chatbot-floating-button"
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
        >
          <RobotOutlined style={{ fontSize: '24px' }} />
        </button>
      </Tooltip>
    );
  }

  return (
    <div className={`chatbot-container ${isMinimized ? 'minimized' : ''}`}>
      <div className="chatbot-header">
        <div className="chatbot-header-content">
          <RobotOutlined className="chatbot-icon" />
          <div>
            <h3 className="chatbot-title">Alaba Marketplace Assistant</h3>
            <p className="chatbot-subtitle">Always here to help</p>
          </div>
        </div>
        <Space size={8}>
          <Tooltip title={isMinimized ? 'Expand' : 'Minimize'}>
            <Button
              type="text"
              size="small"
              icon={<MinusOutlined />}
              onClick={() => setIsMinimized(!isMinimized)}
              style={{ color: '#fff' }}
            />
          </Tooltip>
          <Tooltip title="Close">
            <Button
              type="text"
              size="small"
              icon={<CloseOutlined />}
              onClick={() => setIsOpen(false)}
              style={{ color: '#fff' }}
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
                style={{ marginTop: '40px' }}
              />
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`message message-${msg.type}`}>
                  <div className="message-bubble">
                    <div className="message-content">{msg.content}</div>
                    <div className="message-footer">
                      <span className="message-time">
                        {msg.timestamp.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {msg.type === 'bot' && (
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
              ))
            )}
            {loading && (
              <div className="message message-bot">
                <div className="message-bubble loading-bubble">
                  <Spin size="small" />
                  <span style={{ marginLeft: '8px' }}>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <Divider style={{ margin: '8px 0' }} />

          <div className="chatbot-input-area">
            <Input.TextArea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message... (Shift+Enter for new line)"
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
            <Tooltip title="Clear chat">
              <Button
                type="text"
                size="small"
                icon={<DeleteOutlined />}
                onClick={clearChat}
                className="clear-button"
              >
                Clear
              </Button>
            </Tooltip>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBot;
