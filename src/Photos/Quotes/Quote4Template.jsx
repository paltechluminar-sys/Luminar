import React, { useState, useEffect, useRef } from 'react';
import './Quote4Template.css';

export const Quote4Template = ({ 
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
      const card = textareaRef.current.closest('.portrait-quote-template-card');
      const wrapper = textareaRef.current.closest('.portrait-quote-template-wrapper');
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
    <div className="portrait-quote-template-section-text">
      <textarea
        ref={textareaRef}
        className="portrait-quote-textarea"
        value={localQuoteText}
        onChange={handleQuoteChange}
        placeholder="Enter your quote here"
      />
      
      {/* Overlay display that shows text with closing quote on same line */}
      <div className="portrait-quote-overlay">
        <span className={`portrait-quote-text-display ${!localQuoteText ? 'placeholder' : ''}`}>
          {localQuoteText || 'Enter your quote here'}
        </span>
        <span className="portrait-quote-mark closing-quote">"</span>
      </div>
      
      {/* Absolutely positioned opening quote at top-left */}
      <span className="portrait-quote-mark">"</span>
      
      {/* Speaker Section - positioned absolutely inside */}
      <input
        type="text"
        className="portrait-quote-speaker-input"
        value={speakerName}
        onChange={(e) => setSpeakerName(e.target.value)}
        placeholder="Speaker/Author"
      />
    </div>
  );
};

export default Quote4Template;
