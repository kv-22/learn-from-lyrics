import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './ChatPanel.css';

const ChatPanel = ({ word, translatedOutput, isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [responseId, setResponseId] = useState(null);
  const messagesEndRef = useRef(null);

  // Reset state when word changes or panel closes
  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setInputValue('');
      setResponseId(null);
    }
  }, [isOpen]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const apiHost = window.location.hostname;
      const response = await fetch(`http://${apiHost}:8000/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          word: {
            arabic_text: word.arabic,
            english_translation: word.translation,
            transliteration: word.transliteration,
            base: word.base,
            note: word.note || '',
          },
          query: userMessage,
          translated_output: translatedOutput,
          previous_response_id: responseId || null,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Update response_id for next message
      if (data.response_id) {
        setResponseId(data.response_id);
      }

      // Add assistant message to chat
      setMessages(prev => [...prev, { role: 'assistant', content: data.response || 'No response received.' }]);
    } catch (error) {
      console.error('Error sending chat message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, there was an error processing your question. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="chat-panel-overlay" onClick={onClose}></div>
      <div className="chat-panel">
        <div className="chat-panel-header">
          <div className="chat-panel-title">
            <h3>Ask about this word</h3>
            {word.arabic && (
              <span className="chat-panel-word" dir="rtl">{word.arabic}</span>
            )}
            <br></br>
            {word.transliteration && (
              <span className="chat-panel-word" dir="rtl">{word.transliteration}</span>
            )}
          </div>
          <button className="chat-panel-close" onClick={onClose} aria-label="Close chat">
            ✕
          </button>
        </div>

        <div className="chat-panel-messages">
          {messages.length === 0 && (
            <div className="chat-panel-empty">
              <p>Ask me anything about this word!</p>
            </div>
          )}
          {messages.map((message, idx) => (
            <div key={idx} className={`chat-message chat-message-${message.role}`}>
              <div className="chat-message-content">
                {message.role === 'assistant' ? (
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                ) : (
                  message.content
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="chat-message chat-message-assistant">
              <div className="chat-message-content">
                <div className="chat-typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-panel-input-container">
          <textarea
            className="chat-panel-input"
            placeholder="Type your question..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isLoading}
          />
          <button
            className="chat-panel-send"
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            aria-label="Send message"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default ChatPanel;

