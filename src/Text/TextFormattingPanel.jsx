import React, { useState, useRef, useEffect } from 'react';
import './TextFormattingPanel.css';

const TextFormattingPanel = ({ selectedText, onUpdate, onClose, hideNameInput = false, hideAdvancedControls = false }) => {
  // Helper function to calculate panel position - opens above button on mobile, below on desktop
  const calculatePanelPosition = (buttonRef) => {
    if (!buttonRef?.current) return { top: 0, left: 0 };
    
    const rect = buttonRef.current.getBoundingClientRect();
    const isMobile = window.innerWidth <= 480;
    
    if (isMobile) {
      // On mobile: open panel ABOVE the button
      return {
        top: rect.top - 320, // 320px accounts for typical panel height
        left: rect.left,
      };
    } else {
      // On desktop: open panel BELOW the button (original behavior)
      return {
        top: rect.bottom + 4,
        left: rect.left,
      };
    }
  };

  const [showFontFamily, setShowFontFamily] = useState(false);
  const [showSize, setShowSize] = useState(false);
  const [showFormat, setShowFormat] = useState(false);
  const [showColor, setShowColor] = useState(false);
  const [showOutline, setShowOutline] = useState(false);
  const [showPosition, setShowPosition] = useState(false);
  
  const [fontFamilyPos, setFontFamilyPos] = useState({});
  const [sizePos, setSizePos] = useState({});
  const [formatPos, setFormatPos] = useState({});
  const [colorPos, setColorPos] = useState({});
  const [outlinePos, setOutlinePos] = useState({});
  const [positionPos, setPositionPos] = useState({});

  const fontFamilyRef = useRef(null);
  const sizeRef = useRef(null);
  const formatRef = useRef(null);
  const colorRef = useRef(null);
  const outlineRef = useRef(null);
  const positionRef = useRef(null);
  const panelRef = useRef(null);

  const fontFamilies = [
    // Classic Web-Safe Fonts
    'Arial Black',
    'Arial',
    'Times New Roman',
    'Courier New',
    'Georgia',
    'Trebuchet MS',
    'Verdana',
    'Impact',
    'Comic Sans MS',
    'Palatino Linotype',
    'Lucida Console',
    'Garamond',
    'Arial Narrow',
    'Book Antiqua',
    'Calibri',
    'Cambria',
    'Century Gothic',
    'Helvetica',
    'Tahoma',
    // Decorative Fonts
    'Algerian',
    'Baskerville Old Face',
    'Bauhaus 93',
    'Bell MT',
    'Bodoni MT',
    'Bookman Old Style',
    'Broadway',
    'Brush Script MT',
    'Californian FB',
    'Castellar',
    'Centaur',
    'Chiller',
    'Colonna MT',
    'Constantia',
    'Copperplate Gothic Bold',
    'Curlz MT',
    'Engravers MT',
    'Felix Titling',
    'Forte',
    'Freestyle Script',
    'Gabriola',
    'Gigi',
    'Goudy Old Style',
    'Harrington',
    'Jokerman',
    'Juice ITC',
    'Kristen ITC',
    'Kunstler Script',
    'Magneto',
    'Matura MT Script Capitals',
    'Mistral',
    'Modern No. 20',
    'Monotype Corsiva',
    'Niagara Engraved',
    'Niagara Solid',
    'Palatino',
    'Parchment',
    'Perpetua',
    'Perpetua Titling MT',
    'Playbill',
    'Rockwell',
    'Rockwell Extra Bold',
    'Script MT Bold',
    'Snap ITC',
    'Stencil',
    'Sylfaen',
    'Symbol',
    'Tahoma',
    'Techno',
    'Tempus Sans ITC',
    'Terminal',
    'Tw Cen MT',
    'Tw Cen MT Condensed',
    'Tw Cen MT Condensed Extra Bold',
    'Utsaah',
    'Viner Hand ITC',
    'Vivaldi',
    'Vladimir Script',
    'Webdings',
    'Wingdings',
    'Wingdings 2',
    'Wingdings 3',
  ];

  const fillColorGrid = [
    ['#FFFFFF', '#FFE4E4', '#FFE4CC', '#FFF2CC', '#E2EFDA', '#DDEBF7', '#E7D4F5'],
    ['#F2F2F2', '#FFCCCC', '#FFD9AD', '#FFE699', '#C6EFCE', '#BDD7EE', '#D5A6BD'],
    ['#D9D9D9', '#FFB3B3', '#FFC27D', '#FFD966', '#A9D08E', '#9EC5E6', '#B4A7D6'],
    ['#BFBFBF', '#FFB3B3', '#FFA341', '#FFC000', '#70AD47', '#4472C4', '#9966CC'],
    ['#A6A6A6', '#FF9999', '#FF7F1F', '#FF9900', '#548235', '#2E5090', '#7030A0'],
    ['#808080', '#FF6666', '#E64D0F', '#E67E00', '#375623', '#1C3B5F', '#52278F'],
    ['#595959', '#FF3333', '#B83B0F', '#CC6600', '#1F4E38', '#004B87', '#3D1D5C'],
    ['#000000', '#CC0000', '#990000', '#7F4D00', '#004D26', '#004B87', '#3D1D5C']
  ];

  const fontSizes = ['6px', '8px', '10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '40px', '44px', '48px', '52px', '56px', '60px', '64px', '72px', '80px', '96px'];
  const formatOptions = ['Bold', 'Italic', 'Underline', 'Strikethrough'];
  const colors = ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
  const outlineOptions = ['None', 'Thin', 'Medium', 'Thick'];

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (fontFamilyRef.current && !fontFamilyRef.current.contains(e.target)) setShowFontFamily(false);
      if (sizeRef.current && !sizeRef.current.contains(e.target)) setShowSize(false);
      if (formatRef.current && !formatRef.current.contains(e.target)) setShowFormat(false);
      if (colorRef.current && !colorRef.current.contains(e.target)) setShowColor(false);
      if (positionRef.current && !positionRef.current.contains(e.target)) setShowPosition(false);
      if (outlineRef.current && !outlineRef.current.contains(e.target)) setShowOutline(false);
      
      // Don't close the panel on outside click - only close via explicit close button or deselection
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFontFamilySelect = (font) => {
    onUpdate({ fontFamily: font });
    setShowFontFamily(false);
  };

  const handleSizeSelect = (size) => {
    onUpdate({ fontSize: size });
    setShowSize(false);
  };

  const handleFormatSelect = (format) => {
    onUpdate({ format });
    setShowFormat(false);
  };

  const handleBoldToggle = () => {
    onUpdate({ isBold: !selectedText?.isBold });
  };

  const handleItalicToggle = () => {
    onUpdate({ isItalic: !selectedText?.isItalic });
  };

  const handleUnderlineToggle = () => {
    onUpdate({ isUnderline: !selectedText?.isUnderline });
  };

  const handleStrikethroughToggle = () => {
    onUpdate({ isStrikethrough: !selectedText?.isStrikethrough });
  };

  const handleColorSelect = (color) => {
    onUpdate({ color });
  };

  const handleColorGridSelect = (color) => {
    onUpdate({ color });
    setShowColor(false);
  };

  const handleOutlineSelect = (outline) => {
    onUpdate({ outline });
    setShowOutline(false);
  };

  const handleOutlineColorSelect = (color) => {
    onUpdate({ outlineColor: color });
  };

  const handleOutlineWidthChange = (e) => {
    onUpdate({ outlineWidth: parseFloat(e.target.value) });
  };

  const handleShadowOffsetChange = (e) => {
    onUpdate({ shadowOffset: parseInt(e.target.value) });
  };

  const handleShadowBlurChange = (e) => {
    onUpdate({ shadowBlur: parseInt(e.target.value) });
  };

  const handleShadowColorChange = (e) => {
    onUpdate({ shadowColor: e.target.value });
  };

  const handleGlowIntensityChange = (e) => {
    onUpdate({ glowIntensity: parseInt(e.target.value) });
  };

  const handleGlowColorChange = (e) => {
    onUpdate({ glowColor: e.target.value });
  };

  const handleBevelChange = (e) => {
    onUpdate({ bevelType: e.target.value });
  };

  const handleReflectionChange = (e) => {
    onUpdate({ reflectionType: e.target.value });
  };

  const handleLetterSpacingChange = (e) => {
    onUpdate({ letterSpacing: parseInt(e.target.value) });
  };

  const handleRotationChange = (e) => {
    onUpdate({ rotation: parseInt(e.target.value) });
  };

  const DropdownButton = ({ label, items, show, setShow, onSelect, ref, currentValue, menuPos, setMenuPos, onOpen }) => {
    const handleToggle = () => {
      if (!show && onOpen) {
        onOpen();
      }
      if (ref?.current) {
        const rect = ref.current.getBoundingClientRect();
        setMenuPos({
          top: rect.bottom + 4,
          left: rect.left,
        });
      }
      setShow(!show);
    };

    return (
      <div className="dropdown-button-wrapper" ref={ref}>
        <button
          className={`dropdown-button ${show ? 'active' : ''}`}
          onClick={handleToggle}
          title={label}
        >
          <span className="dropdown-label">{label}</span>
          <svg 
            className="dropdown-arrow-svg" 
            width="12" 
            height="12" 
            viewBox="0 0 12 12" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              d="M2 4.5L6 8.5L10 4.5" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {show && menuPos && (
          <div 
            className="dropdown-menu"
            style={{
              top: `${menuPos.top}px`,
              left: `${menuPos.left}px`,
            }}
          >
            {items.map((item, idx) => (
              <div
                key={idx}
                className="dropdown-item"
                onClick={() => onSelect(item)}
              >
                {item}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="text-formatting-panel" ref={panelRef}>
      {!hideNameInput && (
        <div className="formatting-panel-header-input-row">
          <div className="formatting-panel-header">Brand Name</div>
          <input
            type="text"
            className="brand-name-input"
            value={selectedText?.brandName ?? 'campuslife.co.ke'}
            onChange={(e) => onUpdate({ brandName: e.target.value })}
            placeholder=""
            title="Type your brand name here"
          />
        </div>
      )}
      
      <div className="formatting-panel-content">
        <DropdownButton
          ref={fontFamilyRef}
          label="Font"
          items={fontFamilies}
          show={showFontFamily}
          setShow={setShowFontFamily}
          onSelect={handleFontFamilySelect}
          currentValue={selectedText?.fontFamily}
          menuPos={fontFamilyPos}
          setMenuPos={setFontFamilyPos}
          onOpen={() => {
            setShowSize(false);
            setShowFormat(false);
            setShowColor(false);
            setShowOutline(false);
          }}
        />
        {!hideAdvancedControls && (
          <DropdownButton
            ref={sizeRef}
            label="Size"
            items={fontSizes}
            show={showSize}
            setShow={setShowSize}
            onSelect={handleSizeSelect}
            currentValue={selectedText?.fontSize}
            menuPos={sizePos}
            setMenuPos={setSizePos}
            onOpen={() => {
              setShowFontFamily(false);
              setShowFormat(false);
              setShowColor(false);
              setShowOutline(false);
            }}
          />
        )}
        {/* Format Button with Presets & Effects Tabs */}
        <div className="dropdown-button-wrapper" ref={formatRef}>
          <button
            className={`dropdown-button ${showFormat ? 'active' : ''}`}
            onClick={() => {
              setShowFontFamily(false);
              setShowSize(false);
              setShowColor(false);
              setShowOutline(false);
              if (formatRef?.current) {
                const rect = formatRef.current.getBoundingClientRect();
                setFormatPos({
                  top: rect.bottom + 4,
                  left: rect.left,
                });
              }
              setShowFormat(!showFormat);
            }}
            title="Text Formatting"
          >
            <span className="dropdown-label">Format</span>
            <svg 
              className="dropdown-arrow-svg" 
              width="12" 
              height="12" 
              viewBox="0 0 12 12" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M2 4.5L6 8.5L10 4.5" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {showFormat && formatPos && (
            <div 
              className="dropdown-menu format-panel"
              style={{
                top: `${formatPos.top}px`,
                left: `${formatPos.left}px`,
              }}
            >
              {/* Format Controls - Text Formatting Toggles Only */}
              <div className="format-effects-container">
                <div className="effect-section-header">Text Formatting</div>

                <div className="format-toggle-group">
                  <button
                    className={`format-toggle-btn ${selectedText?.isBold ? 'active' : ''}`}
                    onClick={handleBoldToggle}
                    title="Bold (Ctrl+B)"
                  >
                    <strong>B</strong>
                  </button>
                  <button
                    className={`format-toggle-btn ${selectedText?.isItalic ? 'active' : ''}`}
                    onClick={handleItalicToggle}
                    title="Italic (Ctrl+I)"
                  >
                    <em>I</em>
                  </button>
                  <button
                    className={`format-toggle-btn ${selectedText?.isUnderline ? 'active' : ''}`}
                    onClick={handleUnderlineToggle}
                    title="Underline (Ctrl+U)"
                  >
                    <u>U</u>
                  </button>
                  <button
                    className={`format-toggle-btn ${selectedText?.isStrikethrough ? 'active' : ''}`}
                    onClick={handleStrikethroughToggle}
                    title="Strikethrough"
                  >
                    <s>S</s>
                  </button>
                </div>

                <div className="effect-section-divider"></div>
                <div className="effect-section-header">Clear Formatting</div>

                <button
                  className="format-clear-btn"
                  onClick={() => {
                    onUpdate({
                      isBold: false,
                      isItalic: false,
                      isUnderline: false,
                      isStrikethrough: false,
                    });
                  }}
                >
                  Clear All Formatting
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Position Button with Corner Selection */}
        {!hideAdvancedControls && (
          <div className="dropdown-button-wrapper" ref={positionRef}>
            <button
              className={`dropdown-button ${showPosition ? 'active' : ''}`}
              onClick={() => {
                setShowFontFamily(false);
                setShowSize(false);
                setShowFormat(false);
                setShowColor(false);
                setShowOutline(false);
                if (positionRef?.current) {
                  const rect = positionRef.current.getBoundingClientRect();
                  setPositionPos({
                    top: rect.bottom + 4,
                    left: rect.left,
                  });
                }
                setShowPosition(!showPosition);
              }}
              title="Brand Position"
            >
              <span className="dropdown-label">Position</span>
              <svg 
                className="dropdown-arrow-svg" 
                width="12" 
                height="12" 
                viewBox="0 0 12 12" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  d="M2 4.5L6 8.5L10 4.5" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </svg>
            </button>

            {showPosition && (
              <div className="dropdown-menu" style={positionPos}>
                <div className="position-grid">
                  {/* Top Row */}
                  <button
                    className={`position-btn ${selectedText?.position === 'top-left' ? 'active' : ''}`}
                    onClick={() => { onUpdate({ position: 'top-left' }); setShowPosition(false); }}
                    title="Top Left"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <rect x="0" y="0" width="3" height="3" fill="currentColor"/>
                    </svg>
                  </button>
                  <button
                    className={`position-btn ${selectedText?.position === 'top-center' ? 'active' : ''}`}
                    onClick={() => { onUpdate({ position: 'top-center' }); setShowPosition(false); }}
                    title="Top Center"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <rect x="6.5" y="0" width="3" height="3" fill="currentColor"/>
                    </svg>
                  </button>
                  <button
                    className={`position-btn ${selectedText?.position === 'top-right' ? 'active' : ''}`}
                    onClick={() => { onUpdate({ position: 'top-right' }); setShowPosition(false); }}
                    title="Top Right"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <rect x="13" y="0" width="3" height="3" fill="currentColor"/>
                    </svg>
                  </button>

                  {/* Middle Row */}
                  <button
                    className={`position-btn ${selectedText?.position === 'center-left' ? 'active' : ''}`}
                    onClick={() => { onUpdate({ position: 'center-left' }); setShowPosition(false); }}
                    title="Center Left"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <rect x="0" y="6.5" width="3" height="3" fill="currentColor"/>
                    </svg>
                  </button>
                  <button
                    className={`position-btn ${selectedText?.position === 'center' ? 'active' : ''}`}
                    onClick={() => { onUpdate({ position: 'center' }); setShowPosition(false); }}
                    title="Center"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <rect x="6.5" y="6.5" width="3" height="3" fill="currentColor"/>
                    </svg>
                  </button>
                  <button
                    className={`position-btn ${selectedText?.position === 'center-right' ? 'active' : ''}`}
                    onClick={() => { onUpdate({ position: 'center-right' }); setShowPosition(false); }}
                    title="Center Right"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <rect x="13" y="6.5" width="3" height="3" fill="currentColor"/>
                    </svg>
                  </button>

                  {/* Bottom Row */}
                  <button
                    className={`position-btn ${selectedText?.position === 'bottom-left' ? 'active' : ''}`}
                    onClick={() => { onUpdate({ position: 'bottom-left' }); setShowPosition(false); }}
                    title="Bottom Left"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <rect x="0" y="13" width="3" height="3" fill="currentColor"/>
                    </svg>
                  </button>
                  <button
                    className={`position-btn ${selectedText?.position === 'bottom-center' ? 'active' : ''}`}
                    onClick={() => { onUpdate({ position: 'bottom-center' }); setShowPosition(false); }}
                    title="Bottom Center"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <rect x="6.5" y="13" width="3" height="3" fill="currentColor"/>
                    </svg>
                  </button>
                  <button
                    className={`position-btn ${selectedText?.position === 'bottom-right' ? 'active' : ''}`}
                    onClick={() => { onUpdate({ position: 'bottom-right' }); setShowPosition(false); }}
                    title="Bottom Right"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <rect x="13" y="13" width="3" height="3" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Color Button with Color Grid Panel */}
        <div className="dropdown-button-wrapper" ref={colorRef}>
          <button
            className={`dropdown-button ${showColor ? 'active' : ''}`}
            onClick={() => {
              setShowFontFamily(false);
              setShowSize(false);
              setShowFormat(false);
              setShowOutline(false);
              if (colorRef?.current) {
                const rect = colorRef.current.getBoundingClientRect();
                setColorPos({
                  top: rect.bottom + 4,
                  left: rect.left,
                });
              }
              setShowColor(!showColor);
            }}
            title="Text Colors"
          >
            <span className="dropdown-label">Color</span>
            <svg 
              className="dropdown-arrow-svg" 
              width="12" 
              height="12" 
              viewBox="0 0 12 12" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M2 4.5L6 8.5L10 4.5" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
          
          {showColor && colorPos && (
            <div 
              className="dropdown-menu color-panel"
              style={{
                top: `${colorPos.top}px`,
                left: `${colorPos.left}px`,
              }}
            >
              <div className="color-panel-label">COLORS</div>
              <div className="color-grid">
                {fillColorGrid.map((row, rowIdx) => (
                  <div key={`color-row-${rowIdx}`} className="color-row">
                    {row.map((color, colIdx) => (
                      <button
                        key={`${rowIdx}-${colIdx}`}
                        className="color-dot"
                        style={{ backgroundColor: color }}
                        onClick={() => handleColorGridSelect(color)}
                        title={color}
                      />
                    ))}
                  </div>
                ))}
              </div>
              
              <div className="color-panel-divider"></div>
              
              <label className="color-no-fill-option">
                <input 
                  type="checkbox" 
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleColorGridSelect('transparent');
                    }
                  }}
                />
                <span>No Color</span>
              </label>
              
              <div className="color-custom-section">
                <span className="color-custom-label">CUSTOM:</span>
                <input
                  type="color"
                  defaultValue={selectedText?.color || '#FFFFFF'}
                  onChange={(e) => handleColorGridSelect(e.target.value)}
                  className="color-custom-picker"
                  title="Pick a custom color"
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Outline Button with Color Grid Panel and Effects */}
        <div className="dropdown-button-wrapper" ref={outlineRef}>
          <button
            className={`dropdown-button ${showOutline ? 'active' : ''}`}
            onClick={() => {
              setShowFontFamily(false);
              setShowSize(false);
              setShowFormat(false);
              setShowColor(false);
              if (outlineRef?.current) {
                const rect = outlineRef.current.getBoundingClientRect();
                setOutlinePos({
                  top: rect.bottom + 4,
                  left: rect.left,
                });
              }
              setShowOutline(!showOutline);
            }}
            title="Outline"
          >
            <span className="dropdown-label">Outline</span>
            <svg 
              className="dropdown-arrow-svg" 
              width="12" 
              height="12" 
              viewBox="0 0 12 12" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M2 4.5L6 8.5L10 4.5" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {showOutline && outlinePos && (
            <div 
              className="dropdown-menu outline-panel"
              style={{
                top: `${outlinePos.top}px`,
                left: `${outlinePos.left}px`,
              }}
            >
              {/* Outline Controls - Single Panel */}
              <div className="outline-effects-container">
                {/* Color Grid */}
                <div className="outline-color-grid-container">
                  {fillColorGrid.map((row, rowIdx) => (
                    <div key={`outline-row-${rowIdx}`} className="outline-color-row">
                      {row.map((color, colIdx) => (
                        <button
                          key={`outline-${rowIdx}-${colIdx}`}
                          className="outline-color-dot"
                          style={{ backgroundColor: color }}
                          onClick={() => handleOutlineColorSelect(color)}
                          title={color}
                        />
                      ))}
                    </div>
                  ))}
                </div>

                {/* Color Input */}
                <input
                  type="color"
                  className="outline-color-picker"
                  value={selectedText?.outlineColor || '#000000'}
                  onChange={(e) => onUpdate({ outlineColor: e.target.value })}
                />

                {/* Width Slider */}
                <div className="effect-row width-row">
                  <input
                    type="range"
                    min="0"
                    max="8"
                    step="0.5"
                    value={selectedText?.outlineWidth || 0}
                    onChange={handleOutlineWidthChange}
                  />
                  <span>{selectedText?.outlineWidth || 0}px</span>
                </div>

                {/* No Outline Checkbox */}
                <div className="effect-row">
                  <label>
                    <input 
                      type="checkbox" 
                      checked={selectedText?.outlineWidth === 0}
                      onChange={(e) => onUpdate({ outlineWidth: e.target.checked ? 0 : 2 })}
                    />
                    <span>No Outline</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextFormattingPanel;
