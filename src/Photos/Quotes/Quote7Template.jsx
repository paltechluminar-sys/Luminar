import React, { useState, useEffect, useRef } from 'react';
import './Quote7Template.css';

export const Quote7Template = ({ 
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
      const section = textareaRef.current.closest('.illustrated-quote-template-section-text');
      if (section) {
        section.style.minHeight = `${Math.max(200, scrollHeight + 80)}px`;
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
    <div className="illustrated-quote-template-wrapper">
      <div className="illustrated-quote-template-card">
        <div className="illustrated-quote-template-section-text">
          {/* Textarea wrapper for positioning speaker inside */}
          <div className="illustrated-quote-textarea-wrapper">
            {/* Opening Quote Mark */}
            <span className="illustrated-quote-mark opening-quote">"</span>
            
            {/* Main textarea for typing */}
            <textarea
              ref={textareaRef}
              className="illustrated-quote-textarea"
              value={localQuoteText}
              onChange={handleQuoteChange}
              placeholder="type your quote"
            />
            
            {/* Speaker input - positioned inside textarea */}
            <input
              type="text"
              className="illustrated-quote-speaker-input"
              value={speakerName}
              onChange={(e) => setSpeakerName(e.target.value)}
              placeholder="Speaker Name"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quote7Template;
