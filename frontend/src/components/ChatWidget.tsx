'use client';

import { useState, useRef, useEffect } from 'react';

type Message = {
  role: 'user' | 'ai';
  text: string;
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Hi! I\'m your AI rental assistant. Tell me what kind of home you\'re looking for and your preferred location. 🏠' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage }),
      });

      if (!res.ok) throw new Error('API error');
      
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'ai', text: data.answer || 'Sorry, I could not process that request.' }]);
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'ai', text: 'Sorry, I am having trouble connecting right now. Please try again later.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-widget-container">
      {isOpen && (
        <div className="chat-widget-window">
          {/* Header */}
          <div className="chat-widget-header">
            <h3>RentalAI Assistant</h3>
            <button className="chat-widget-close" onClick={toggleChat} aria-label="Close chat">×</button>
          </div>

          {/* Messages */}
          <div className="chat-widget-messages">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`chat-msg ${msg.role === 'ai' ? 'chat-msg-ai' : 'chat-msg-user'}`}
              >
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="chat-typing-indicator">
                <div className="chat-typing-dot"></div>
                <div className="chat-typing-dot"></div>
                <div className="chat-typing-dot"></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form className="chat-widget-input-area" onSubmit={handleSend}>
            <input
              type="text"
              className="chat-widget-input"
              placeholder="Ask about rentals..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="chat-widget-send" disabled={isTyping} aria-label="Send">
              ➤
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Button with Custom SVG Brand Logo */}
      {!isOpen && (
        <button className="chat-widget-fab" onClick={toggleChat} aria-label="Open chat assistant">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Chat bubble */}
            <rect x="3" y="10" width="22" height="14" rx="4" fill="white"/>
            <polygon points="9,24 13,24 9,28" fill="white"/>
            {/* House roof inside bubble */}
            <path d="M14 13 L9 17 L10.5 17 L10.5 21 L13 21 L13 19 L15 19 L15 21 L17.5 21 L17.5 17 L19 17 Z" fill="#2563eb"/>
          </svg>
        </button>
      )}
    </div>
  );
}
