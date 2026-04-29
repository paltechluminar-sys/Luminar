import React, { useState, useEffect, useRef } from 'react';
import './Quote3Template.css';

export const Quote3Template = ({ 
  quoteText = '', 
  onQuoteChange = null,
  speaker = 'Speaker',
  handle = 'BIGDREAMS.IN'
}) => {
  const [localQuoteText, setLocalQuoteText] = useState(quoteText);
  const [speakerName, setSpeakerName] = useState(speaker);
  const [speakerHandle, setSpeakerHandle] = useState(handle);
  const textareaRef = useRef(null);

  useEffect(() => {
    setLocalQuoteText(quoteText);
  }, [quoteText]);

  useEffect(() => {
    // Auto-expand textarea on mount/update
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${scrollHeight}px`;
      
      // Expand parent containers
      const card = textareaRef.current.closest('.large-quote-template-card');
      const wrapper = textareaRef.current.closest('.large-quote-template-wrapper');
      if (card) {
        card.style.minHeight = `${Math.max(240, scrollHeight + 120)}px`;
      }
      if (wrapper) {
        wrapper.style.minHeight = `${Math.max(280, scrollHeight + 160)}px`;
      }
    }
  }, [localQuoteText]);

  const handleQuoteChange = (e) => {
    const newText = e.target.value;
    setLocalQuoteText(newText);
    if (onQuoteChange) {
      onQuoteChange(newText);
    }
  };

  return (
    <div className="large-quote-template-wrapper">
      <div className="large-quote-template-card">
        
        {/* ===== SECTION 1: HANDLE ===== */}
        <div className="large-quote-template-section-handle">
          <span className="large-quote-template-handle-prefix">@</span>
          <input 
            type="text"
            className="large-quote-template-handle-input"
            value={speakerHandle}
            onChange={(e) => setSpeakerHandle(e.target.value)}
            placeholder="BIGDREAMS.IN"
          />
        </div>

        {/* Divider Space */}
        <div className="large-quote-template-divider"></div>

        {/* ===== SECTION 2: QUOTE TEXT ===== */}
        <div className="large-quote-template-section-text">
          <textarea
            ref={textareaRef}
            className="large-quote-template-quote-textarea"
            value={localQuoteText}
            onChange={handleQuoteChange}
            placeholder="Enter your quote here"
          />
        </div>

        {/* ===== SECTION 3: SPEAKER ===== */}
        <div className="large-quote-template-section-speaker">
          <span className="large-quote-template-speaker-prefix">-</span>
          <input 
            type="text"
            className="large-quote-template-speaker-input"
            value={speakerName}
            onChange={(e) => setSpeakerName(e.target.value)}
            placeholder="Speaker Name"
          />
        </div>
        
      </div>
    </div>
  );
};

export default Quote3Template;
