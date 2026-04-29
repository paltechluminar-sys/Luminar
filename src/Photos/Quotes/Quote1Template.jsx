import React, { useState, useEffect, useRef } from 'react';
import VerificationBadge from '../../Admin/components/VerificationBadge';
import './Quote1Template.css';

/**
 * SocialQuoteTemplate Component
 * Two-section layout:
 * 1. Header Section: Avatar + Speaker name/handle side by side
 * 2. Quote Text Section: Large text input area below with spacing
 */
export const Quote1Template = ({ 
  quoteText = '', 
  onQuoteChange = null,
  speaker = 'Elon Musk',
  avatarColor = 'linear-gradient(135deg, #1da1f2 0%, #1991da 100%)'
}) => {
  const [speakerName, setSpeakerName] = useState(speaker);
  const [speakerHandle, setSpeakerHandle] = useState(speaker.toLowerCase().replace(/\s+/g, ''));
  const [localQuoteText, setLocalQuoteText] = useState(quoteText);
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
      const card = textareaRef.current.closest('.social-template-card');
      const wrapper = textareaRef.current.closest('.social-template-wrapper');
      if (card) {
        card.style.minHeight = `${Math.max(300, scrollHeight + 100)}px`;
      }
      if (wrapper) {
        wrapper.style.minHeight = `${Math.max(340, scrollHeight + 140)}px`;
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
    <div className="social-template-wrapper">
      <div className="social-template-card">
        
        {/* ===== SECTION 1: HEADER ===== */}
        <div className="social-template-section-header">
          {/* Avatar */}
          <div 
            className="social-template-avatar"
            style={{ background: avatarColor }}
          ></div>
          
          {/* Speaker Info */}
          <div className="social-template-userinfo">
            <div className="social-template-name-line">
              <input 
                type="text"
                className="social-template-name-input"
                value={speakerName}
                onChange={(e) => setSpeakerName(e.target.value)}
                placeholder="Username"
              />
              <span className="social-template-badge">
                <VerificationBadge tier="premium" size="sm" showTooltip={false} />
              </span>
            </div>
            <div className="social-template-handle-line">
              <span className="social-template-handle-prefix">@</span>
              <input 
                type="text"
                className="social-template-handle-input"
                value={speakerHandle}
                onChange={(e) => setSpeakerHandle(e.target.value)}
                placeholder="handle"
              />
            </div>
          </div>
        </div>

        {/* Divider Space - No Touching */}
        <div className="social-template-divider"></div>

        {/* ===== SECTION 2: QUOTE TEXT ===== */}
        <div className="social-template-section-text">
          <textarea
            ref={textareaRef}
            className="social-template-quote-textarea"
            value={localQuoteText}
            onChange={handleQuoteChange}
            placeholder="Enter your quote here"
          />
        </div>
        
      </div>
    </div>
  );
};

export default Quote1Template;
