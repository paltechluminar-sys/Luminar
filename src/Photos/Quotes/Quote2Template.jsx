import React, { useState, useEffect, useRef } from 'react';
import './Quote2Template.css';

export const Quote2Template = ({ 
  quoteText = '', 
  onQuoteChange = null,
  speaker = 'Speaker'
}) => {
  const [localQuoteText, setLocalQuoteText] = useState(quoteText);
  const [speakerName, setSpeakerName] = useState(speaker);
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
      const card = textareaRef.current.closest('.inspirational-template-card');
      const wrapper = textareaRef.current.closest('.inspirational-template-wrapper');
      if (card) {
        card.style.minHeight = `${Math.max(200, scrollHeight + 80)}px`;
      }
      if (wrapper) {
        wrapper.style.minHeight = `${Math.max(240, scrollHeight + 120)}px`;
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
    <div className="inspirational-template-section-text">
      {/* Quote Mark - positioned absolutely inside */}
      <span className="inspirational-quote-mark">"</span>
      
      <textarea
        ref={textareaRef}
        className="inspirational-quote-textarea"
        value={localQuoteText}
        onChange={handleQuoteChange}
        placeholder="Enter your quote here"
      />
      
      {/* Speaker Section - positioned absolutely inside */}
      <input
        type="text"
        className="inspirational-speaker-input"
        value={speakerName}
        onChange={(e) => setSpeakerName(e.target.value)}
        placeholder="Speaker/Author"
      />
    </div>
  );
};

export default Quote2Template;
