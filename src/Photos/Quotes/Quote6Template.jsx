import React, { useState, useEffect, useRef } from 'react';
import './Quote6Template.css';

export const Quote6Template = ({ 
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
      const section = textareaRef.current.closest('.photo-quote-side-flipped-template-section-text');
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
    <div className="photo-quote-side-flipped-template-wrapper">
      <div className="photo-quote-side-flipped-template-card">
        <div className="photo-quote-side-flipped-template-section-text">
          {/* Textarea wrapper for positioning speaker inside */}
          <div className="photo-quote-side-flipped-textarea-wrapper">
            {/* Opening Quote Mark */}
            <span className="photo-quote-side-flipped-mark opening-quote">"</span>
            
            {/* Main textarea for typing */}
            <textarea
              ref={textareaRef}
              className="photo-quote-side-flipped-textarea"
              value={localQuoteText}
              onChange={handleQuoteChange}
              placeholder="type your quote"
            />
            
            {/* Speaker input - positioned inside textarea */}
            <input
              type="text"
              className="photo-quote-side-flipped-speaker-input"
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

export default Quote6Template;
