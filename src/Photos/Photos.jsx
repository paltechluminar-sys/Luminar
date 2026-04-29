import React, { useState, useCallback, useRef, useEffect } from 'react';
import './PhotoEditor.css';
import { PhotosCanvas } from './Photos/PhotosCanvas';
import { PhotosControls } from './Photos/PhotosControls';
import { PhotosDownload } from './Photos/PhotosDownload';
import { PhotosFilterControls } from './Photos/PhotosFilterControls';
import TextFormattingPanel from '../Text/TextFormattingPanel';
import { CropTool } from './Photos/CropTool';
import { cropImage } from './Photos/CropUtils';
import { MergePanel } from './Photos/MergePanel';
import { QuotePanel } from './Quotes/QuotePanel';
import PaltechWhiteLogo from '../Assets/Paltech White.png';

export const Photos = ({ initialImage, onSubscriptionModalOpen }) => {
  const [image, setImage] = useState(initialImage || null);
  const [imageDimensions, setImageDimensions] = useState({ width: 888, height: 588 });
  const [activeElement, setActiveElement] = useState({ type: null, id: null });
  const [selectedFeature, setSelectedFeature] = useState(null);
  
  // Text state
  const [texts, setTexts] = useState([]);
  const [selectedTextId, setSelectedTextId] = useState(null);
  
  // Logo state
  const [logos, setLogos] = useState([]);
  const [fontFamily, setFontFamily] = useState('Segoe UI');
  const [textColor, setTextColor] = useState('#000000');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [textStyles, setTextStyles] = useState({ bold: false, italic: false, underline: 'none' });
  const [textFill, setTextFill] = useState('solidColor');
  const [textOutlineColor, setTextOutlineColor] = useState('#000000');
  const [textOutlineWidth, setTextOutlineWidth] = useState(0);
  const [textOutlineStyle, setTextOutlineStyle] = useState('solid');
  const [textIsBold, setTextIsBold] = useState(false);
  const [textIsItalic, setTextIsItalic] = useState(false);
  const [textIsUnderline, setTextIsUnderline] = useState(false);
  const [textIsStrikethrough, setTextIsStrikethrough] = useState(false);
  const [textShadowOffset, setTextShadowOffset] = useState(0);
  const [textShadowBlur, setTextShadowBlur] = useState(0);
  const [textShadowColor, setTextShadowColor] = useState('#000000');
  const [textGlowIntensity, setTextGlowIntensity] = useState(0);
  const [textGlowColor, setTextGlowColor] = useState('#FFFFFF');
  const [textLetterSpacing, setTextLetterSpacing] = useState(0);
  const [textRotation, setTextRotation] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isRotating, setIsRotating] = useState(false);
  const [rotationStartAngle, setRotationStartAngle] = useState(0);
  const [rotationCenter, setRotationCenter] = useState({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    grayscale: 0,
    sepia: 0,
    blur: 0,
  });
  const [customMatchTime, setCustomMatchTime] = useState('');
  const [showScoreBox, setShowScoreBox] = useState(false);
  const [brandName, setBrandName] = useState('campuslife.co.ke');
  const [brandFontFamily, setBrandFontFamily] = useState('primary');
  const [brandFontSize, setBrandFontSize] = useState(20);
  const [brandFontWeight, setBrandFontWeight] = useState(400);
  const [brandColor, setBrandColor] = useState('#FFFFFF');
  const [brandFill, setBrandFill] = useState('none');
  const [brandOutlineColor, setBrandOutlineColor] = useState('#000000');
  const [brandOutlineWidth, setBrandOutlineWidth] = useState(0);
  const [brandOutlineStyle, setBrandOutlineStyle] = useState('solid');
  const [brandIsBold, setBrandIsBold] = useState(false);
  const [brandIsItalic, setBrandIsItalic] = useState(false);
  const [brandIsUnderline, setBrandIsUnderline] = useState(false);
  const [brandIsStrikethrough, setBrandIsStrikethrough] = useState(false);
  const [brandShadowOffset, setBrandShadowOffset] = useState(0);
  const [brandShadowBlur, setBrandShadowBlur] = useState(0);
  const [brandShadowColor, setBrandShadowColor] = useState('#000000');
  const [brandGlowIntensity, setBrandGlowIntensity] = useState(0);
  const [brandGlowColor, setBrandGlowColor] = useState('#FFFFFF');
  const [brandLetterSpacing, setBrandLetterSpacing] = useState(0);
  const [brandRotation, setBrandRotation] = useState(0);
  const [brandPosition, setBrandPosition] = useState('top-right');
  const [matchStatus, setMatchStatus] = useState('Full-Time');
  const [spokesperson, setSpokesperson] = useState('');
  const [matchDateTime, setMatchDateTime] = useState({
    weekday: new Date().toLocaleString('en-US', { weekday: 'short' }),
    day: new Date().getDate(),
    month: new Date().toLocaleString('en-US', { month: 'short' }),
    hour: new Date().getHours().toString(),
    minute: '45',
    year: new Date().getFullYear().toString(),
  });
  const [canvasRefs, setCanvasRefs] = useState({ canvasRef: null, imageRef: null, additionalImageRefs: [] });
  const [additionalImages, setAdditionalImages] = useState([]);
  const [isCropping, setIsCropping] = useState(false);
  const [cropArea, setCropArea] = useState(null);
  const [selectedMergeLayout, setSelectedMergeLayout] = useState(null);
  const [mergedImages, setMergedImages] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedQuoteDesign, setSelectedQuoteDesign] = useState(null);
  const [mergeOrientation, setMergeOrientation] = useState('square');
  const [mergeOutlineWidth, setMergeOutlineWidth] = useState(2);
  const [mergeOutlineColor, setMergeOutlineColor] = useState('#777777');
  const [mergeFilters, setMergeFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    grayscale: 0,
    sepia: 0,
    blur: 0,
  });
  const [hoveredMergeCell, setHoveredMergeCell] = useState(null);
  const [changeImageSlot, setChangeImageSlot] = useState(null);
  const [isChangeImageMode, setIsChangeImageMode] = useState(false);

  const textInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const newPhotoInputRef = useRef(null);
  const mergePhotoInputRef = useRef(null);
  const changeImageInputRef = useRef(null);
  const mergePanelRef = useRef(null);
  const canvasPanelRef = useRef(null);
  const quotePanelRef = useRef(null);

  // Initialize default Paltech logo when component mounts with an image
  useEffect(() => {
    if (image && logos.length === 0) {
      const defaultLogo = {
        id: `logo-default-${Date.now()}`,
        type: 'logo',
        src: PaltechWhiteLogo,
        x: 20,
        y: 20,
        scale: 0.6,
        rotation: 0,
        opacity: 1,
        scaleWidth: 1.5,
        scaleHeight: 1.5,
      };
      setLogos([defaultLogo]);
    }
  }, [image]);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target.result);
      setTexts([]);
      // Load default Paltech logo instead of clearing
      const defaultLogo = {
        id: `logo-default-${Date.now()}`,
        type: 'logo',
        src: PaltechWhiteLogo,
        x: 20,
        y: 20,
        scale: 0.6,
        rotation: 0,
        opacity: 1,
        scaleWidth: 1.5,
        scaleHeight: 1.5,
      };
      setLogos([defaultLogo]);
      setIsCropping(false);
    };
    reader.readAsDataURL(file);
  }, []);

  const readFilesAsDataURLs = useCallback((files) => {
    return Promise.all(
      Array.from(files).map((file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
      )
    );
  }, []);



  // Wrapper for addText that includes UI state updates
  const addText = useCallback(() => {
    const newText = {
      id: Date.now(),
      content: '',
      x: 0,
      y: 50,
      fontSize: 16,
      fontFamily: fontFamily,
      color: textColor,
      stroke: strokeColor,
      bold: true,
      italic: false,
      underline: textIsUnderline ? 'single' : 'none',
      rotation: textRotation,
      fill: textFill,
      outlineColor: '#000000',
      outlineWidth: 0,
      outlineStyle: textOutlineStyle,
      strikethrough: textIsStrikethrough || false,
      shadowOffset: textShadowOffset,
      shadowBlur: textShadowBlur,
      shadowColor: textShadowColor,
      glowIntensity: textGlowIntensity,
      glowColor: textGlowColor,
      letterSpacing: textLetterSpacing,
      type: 'text',
      scale: 1,
    };
    setTexts(prev => [...prev, newText]);
    setSelectedTextId(newText.id);
    setSelectedFeature('text');
    setActiveElement({ type: 'text', id: newText.id });
    setIsEditing(true);
    setIsCropping(false);
  }, [fontFamily, textColor, strokeColor, textIsBold, textIsItalic, textIsUnderline, textRotation, textFill, textOutlineColor, textOutlineWidth, textOutlineStyle, textIsStrikethrough, textShadowOffset, textShadowBlur, textShadowColor, textGlowIntensity, textGlowColor, textLetterSpacing]);







  const handleDrag = () => {
    // Drag handling not needed for Photos
  };

  const stopDragging = () => {
    // Drag handling not needed for Photos
  };

  const handleRotation = () => {
    // Rotation handling not needed for Photos
  };

  const stopRotation = () => {
    // Rotation handling not needed for Photos
  };

  const handleResize = useCallback(() => {
    // Resize handling not needed for Photos
  }, []);

  const stopResizing = useCallback(() => {
    // Resize handling not needed for Photos
  }, []);

  const deleteElement = useCallback(() => {
    if (activeElement.type === 'text') {
      setTexts(prev => prev.filter(text => text.id !== activeElement.id));
    } else if (activeElement.type === 'logo') {
      setLogos(prev => prev.filter(logo => logo.id !== activeElement.id));
    }
    setActiveElement({ type: null, id: null });
  }, [activeElement]);

  // Auto-delete empty texts when deselected
  useEffect(() => {
    if (activeElement.type === null && activeElement.id === null) {
      setTexts(prev => prev.filter(text => text.content && text.content.trim() !== ''));
    }
  }, [activeElement]);

  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  }, []);



  const handleQuoteClick = useCallback(() => {
    setSelectedFeature((prev) => (prev === 'quote' ? null : 'quote'));
    setIsCropping(false);
    if (selectedFeature !== 'quote') {
      const now = new Date();
      const formattedDateTime = `${now.toLocaleString('en-US', { weekday: 'short' })} ${now.getDate()}/${now.toLocaleString('en-US', { month: 'short' })} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      setMatchStatus(formattedDateTime);
      setCustomMatchTime('');
      setSpokesperson('');
      setShowScoreBox(true);
    } else {
      setMatchStatus('Full-Time');
      setCustomMatchTime('');
      setSpokesperson('');
    }
  }, [selectedFeature]);

  const handleQuoteDesignSelect = useCallback((design) => {
    // Select the new template - the old interface will be hidden
    // and replaced with the template interface with preview + controls
    // Keep the quote text and speaker for continuity across templates
    setSelectedQuoteDesign(design.id);
    setShowScoreBox(true);
  }, []);

  const addLogo = useCallback((logoSrc) => {
    if (!logoSrc) return;
    
    // If there's already a default logo, replace it instead of adding
    const isDefaultLogo = logos.length === 1 && logos[0].src === PaltechWhiteLogo;
    
    if (isDefaultLogo) {
      // Replace the default logo
      const newLogo = {
        ...logos[0],
        src: logoSrc,
        id: `logo-${Date.now()}`,
      };
      setLogos([newLogo]);
      setActiveElement({ type: 'logo', id: newLogo.id });
    } else {
      // Add new logo
      const newLogo = {
        id: `logo-${Date.now()}`,
        type: 'logo',
        src: logoSrc,
        x: 50,
        y: 50,
        scale: 0.6,
        rotation: 0,
        opacity: 1,
        scaleWidth: 3,
        scaleHeight: 3,
      };
      setLogos((prev) => [...prev, newLogo]);
      setActiveElement({ type: 'logo', id: newLogo.id });
    }
    setSelectedFeature('logo');
  }, [logos]);

  const updateLogo = useCallback((id, updates) => {
    setLogos((prev) => prev.map((logo) => (logo.id === id ? { ...logo, ...updates } : logo)));
  }, []);

  const handleBrandChange = useCallback((value) => {
    setBrandName(value);
  }, []);

  const handleBrandFontFamilyChange = useCallback((e) => {
    setBrandFontFamily(e.target.value);
  }, []);

  const handleBrandFontSizeChange = useCallback((e) => {
    setBrandFontSize(parseInt(e.target.value));
  }, []);

  const handleBrandFontWeightChange = useCallback((e) => {
    setBrandFontWeight(parseInt(e.target.value));
  }, []);

  const handleCropClick = useCallback(() => {
    setIsCropping((prev) => {
      if (!prev) {
        // When opening crop, close merge
        setSelectedFeature(null);
      }
      return !prev;
    });
  }, []);

  const closeCrop = useCallback(() => {
    setIsCropping(false);
  }, []);

  const handleCropCancel = useCallback(() => {
    setIsCropping(false);
  }, []);

  const handleCropComplete = useCallback(async () => {
    if (!image || !cropArea) return;

    try {
      const croppedImage = await cropImage(image, cropArea, imageDimensions);
      setImage(croppedImage);
      setTexts([]);
      setIsCropping(false);
      setCropArea(null);
    } catch (error) {
      console.error('Error cropping image:', error);
      alert('Failed to crop image. Please try again.');
    }
  }, [image, cropArea, imageDimensions]);

  // Handle merge image upload
  const handleMergeImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setMergedImages(prev => {
        const newImages = [...prev];
        if (selectedSlot !== null && selectedMergeLayout && selectedSlot < selectedMergeLayout.grid.columns * selectedMergeLayout.grid.rows) {
          // Replace image at selected slot
          newImages[selectedSlot] = {
            src: event.target.result,
            fit: 'cover',
            opacity: 100,
          };
        } else {
          // Append to the end
          newImages.push({
            src: event.target.result,
            fit: 'cover',
            opacity: 100,
          });
        }
        return newImages;
      });
      setSelectedSlot(null); // Reset after selection
    };
    reader.readAsDataURL(file);
  }, [selectedSlot, selectedMergeLayout]);

  // Handle merge layout select
  const handleMergeLayoutSelect = useCallback((layout) => {
    setSelectedMergeLayout(layout);
  }, []);

  const handleMergeUploadClick = useCallback(() => {
    mergePhotoInputRef.current?.click();
  }, []);

  const handleChangeImageClick = useCallback((slotIndex) => {
    setChangeImageSlot(slotIndex);
    changeImageInputRef.current?.click();
  }, []);

  const handleChangeImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file || changeImageSlot === null) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setMergedImages(prev => {
        const newImages = [...prev];
        newImages[changeImageSlot] = {
          src: event.target.result,
          fit: 'cover',
          opacity: 100,
        };
        return newImages;
      });
      setChangeImageSlot(null);
      setHoveredMergeCell(null);
      setIsChangeImageMode(false);
    };
    reader.readAsDataURL(file);
  }, [changeImageSlot]);

  // Handle outside click to close merge panel
  useEffect(() => {
    if (selectedFeature === 'merge') {
      // Reset to square orientation when merge panel opens
      setMergeOrientation('square');
    }
  }, [selectedFeature]);

  // Previous outside click handler
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (selectedFeature === 'merge') {
        const isClickOnMergePanel = mergePanelRef.current && mergePanelRef.current.contains(event.target);
        const isClickOnCanvasPanel = canvasPanelRef.current && canvasPanelRef.current.contains(event.target);
        const isClickOnButton = event.target.closest('button');
        
        // Close only if clicking outside both the merge panel and the entire canvas area
        if (!isClickOnMergePanel && !isClickOnCanvasPanel && !isClickOnButton) {
          setSelectedFeature(null);
        }
      } else if (selectedFeature === 'quote') {
        const isClickOnQuotePanel = quotePanelRef.current && quotePanelRef.current.contains(event.target);
        const isClickOnCanvasPanel = canvasPanelRef.current && canvasPanelRef.current.contains(event.target);
        const isClickOnButton = event.target.closest('button');
        
        // Close only if clicking outside the quote panel and the entire canvas area
        if (!isClickOnQuotePanel && !isClickOnCanvasPanel && !isClickOnButton) {
          setSelectedFeature(null);
        }
      }
    };

    if (selectedFeature === 'merge' || selectedFeature === 'quote') {
      document.addEventListener('mousedown', handleOutsideClick);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }
  }, [selectedFeature]);

  // Update selectedTextId when activeElement changes to text
  useEffect(() => {
    if (activeElement.type === 'text' && activeElement.id) {
      setSelectedTextId(activeElement.id);
    }
  }, [activeElement]);

  return (
    <div className="sports-editor">
      <div className="editor-container" style={{ display: 'flex', flexDirection: 'column' }}>
        <PhotosControls
          addText={addText}
          addLogo={addLogo}
          deleteElement={deleteElement}
          handleFilterChange={handleFilterChange}
          selectedFeature={selectedFeature}
          setSelectedFeature={setSelectedFeature}
          activeElement={activeElement}
          filters={filters}
          handleImageUpload={handleImageUpload}
          newPhotoInputRef={newPhotoInputRef}
          handleQuoteClick={handleQuoteClick}
          handleCropClick={handleCropClick}
          closeCrop={closeCrop}
          isCropping={isCropping}
          brandName={brandName}
          handleBrandChange={handleBrandChange}
          brandFontFamily={brandFontFamily}
          handleBrandFontFamilyChange={handleBrandFontFamilyChange}
          brandFontSize={brandFontSize}
          handleBrandFontSizeChange={handleBrandFontSizeChange}
          brandFontWeight={brandFontWeight}
          handleBrandFontWeightChange={handleBrandFontWeightChange}
        />
        <div className={`canvas-and-filters-container ${selectedFeature === 'filters' ? 'with-filters' : ''}`}>
          <div className={`canvas-panel ${selectedFeature === 'merge' && window.innerWidth <= 768 ? 'merge-mobile-portrait' : ''}`} ref={canvasPanelRef} style={{ position: 'relative', overflow: 'visible', display: 'flex', gap: '16px' }}>
            {/* Main Canvas Area */}
            <div style={{ flex: 1, position: 'relative' }}>
              {isCropping && image && (
                  <div style={{ 
                    position: 'absolute', 
                    inset: 0,
                    zIndex: 999, 
                    width: '100%', 
                    height: '100%',
                    display: 'block',
                    pointerEvents: 'auto'
                  }}>
                    <CropTool
                      image={image}
                      imageDimensions={imageDimensions}
                      onCropComplete={handleCropComplete}
                      onCancel={handleCropCancel}
                      imageRef={canvasRefs.imageRef}
                      cropArea={cropArea}
                      onCropAreaChange={setCropArea}
                    />
                  </div>
                )}
                <PhotosCanvas
              image={image}
              setImage={setImage}
              texts={texts}
              setTexts={setTexts}
              logos={logos}
              setLogos={setLogos}
              updateLogo={updateLogo}
              filters={filters}
              activeElement={activeElement}
              setActiveElement={setActiveElement}
              dragging={dragging}
              isRotating={isRotating}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              textStyles={textStyles}
              textColor={textColor}
              strokeColor={strokeColor}
              fontInfo={fontFamily}
              brandName={brandName}
              brandFontFamily={brandFontFamily}
              brandFontSize={brandFontSize}
              brandColor={brandColor}
              brandFill={brandFill}
              brandOutlineColor={brandOutlineColor}
              brandOutlineWidth={brandOutlineWidth}
              brandOutlineStyle={brandOutlineStyle}
              brandIsBold={brandIsBold}
              brandIsItalic={brandIsItalic}
              brandIsUnderline={brandIsUnderline}
              brandIsStrikethrough={brandIsStrikethrough}
              brandShadowOffset={brandShadowOffset}
              brandShadowBlur={brandShadowBlur}
              brandShadowColor={brandShadowColor}
              brandGlowIntensity={brandGlowIntensity}
              brandGlowColor={brandGlowColor}
              brandLetterSpacing={brandLetterSpacing}
              brandRotation={brandRotation}
              brandPosition={brandPosition}
              handleDrag={handleDrag}
              handleTouchMove={() => {}}
              handleTouchEnd={() => {}}
              handleMouseWheelRotation={() => {}}
              handleTextZoom={() => {}}
              handleLogoResize={() => {}}
              stopDragging={stopDragging}
              handleRotation={handleRotation}
              stopRotation={stopRotation}
              handleResize={handleResize}
              stopResizing={stopResizing}
              handleElementClick={(type, id) => setActiveElement({ type, id })}
              handleDoubleClick={() => {}}
              startLongPress={() => {}}
              handleTextBlur={() => {}}
              handleTextKeyDown={() => {}}
              handleTouchZoom={() => {}}
              setCanvasRefs={setCanvasRefs}
              updateText={(id, updates) => setTexts(prev => prev.map(text => text.id === id ? { ...text, ...updates } : text))}
              textInputRef={textInputRef}
              selectedFeature={selectedFeature}
              handleImageUpload={handleImageUpload}
              fileInputRef={fileInputRef}
              setImageDimensions={setImageDimensions}
              showScoreBox={showScoreBox}
              setShowScoreBox={setShowScoreBox}
              customMatchTime={customMatchTime}
              setCustomMatchTime={setCustomMatchTime}
              spokesperson={spokesperson}
              setSpokesperson={setSpokesperson}
              matchDateTime={matchDateTime}
              setMatchDateTime={setMatchDateTime}
              additionalImages={additionalImages}
              setAdditionalImages={setAdditionalImages}
              handleAdditionalImageUpload={() => {}}
              selectedMergeLayout={selectedMergeLayout}
              mergedImages={mergedImages}
              mergeOrientation={mergeOrientation}
              mergeOutlineWidth={mergeOutlineWidth}
              mergeOutlineColor={mergeOutlineColor}
              hoveredMergeCell={hoveredMergeCell}
              setHoveredMergeCell={setHoveredMergeCell}
              handleChangeImageClick={handleChangeImageClick}
              isChangeImageMode={isChangeImageMode}
              setIsChangeImageMode={setIsChangeImageMode}
              selectedQuoteDesign={selectedQuoteDesign}
                  />

            </div>


          </div>
        </div>
        {selectedFeature === 'merge' && (
          <div 
            className="merge-panel-sidebar" 
            ref={mergePanelRef} 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              background: '#1a1f26', 
              border: '1px solid #2a3942', 
              padding: '16px', 
              overflowY: 'auto',
              overflowX: 'hidden',
              scrollbarWidth: 'thin', 
              scrollbarColor: '#444 transparent',
              display: 'flex',
              flexDirection: 'column',
              gap: '0px'
            }}>
              {/* Orientation, Color, Width Controls - All in one line */}
              <div style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center', flexWrap: 'nowrap', paddingBottom: '8px', marginBottom: '0px', borderBottom: '1px solid #2a3942', overflowX: 'auto' }}>
                {/* Orientation Controls */}
                <div style={{ display: 'flex', gap: '2px', alignItems: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '9px', color: '#e9edef', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Orient:</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '1px', cursor: 'pointer', fontSize: '9px', color: '#e9edef' }}>
                    <input
                      type="radio"
                      name="orientation"
                      value="portrait"
                      checked={mergeOrientation === 'portrait'}
                      onChange={(e) => setMergeOrientation(e.target.value)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>📱</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '1px', cursor: 'pointer', fontSize: '9px', color: '#e9edef' }}>
                    <input
                      type="radio"
                      name="orientation"
                      value="landscape"
                      checked={mergeOrientation === 'landscape'}
                      onChange={(e) => setMergeOrientation(e.target.value)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>🎬</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '1px', cursor: 'pointer', fontSize: '9px', color: '#e9edef' }}>
                    <input
                      type="radio"
                      name="orientation"
                      value="square"
                      checked={mergeOrientation === 'square'}
                      onChange={(e) => setMergeOrientation(e.target.value)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>⬜</span>
                  </label>
                </div>

                {/* Color Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                  <label style={{ fontSize: '9px', color: '#e9edef', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Color:</label>
                  <input
                    type="color"
                    value={mergeOutlineColor}
                    onChange={(e) => setMergeOutlineColor(e.target.value)}
                    style={{ width: '20px', height: '20px', border: '1px solid #2a3942', borderRadius: '3px', cursor: 'pointer', padding: '0', margin: '0', background: 'transparent', flexShrink: 0 }}
                  />
                </div>

                {/* Width Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: '80px', flex: '0 1 auto' }}>
                  <label style={{ fontSize: '9px', color: '#e9edef', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Width:</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={mergeOutlineWidth}
                    onChange={(e) => setMergeOutlineWidth(parseFloat(e.target.value))}
                    style={{ flex: 1, cursor: 'pointer', minWidth: '40px', height: '4px' }}
                  />
                  <span style={{ fontSize: '8px', color: '#999', minWidth: '24px', textAlign: 'right', flexShrink: 0 }}>{mergeOutlineWidth}px</span>
                </div>
              </div>

              {/* Layout Selection Section */}
              <div style={{ marginTop: '0px', paddingTop: '8px', width: '100%' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  gap: '12px',
                  marginBottom: '8px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ fontSize: '10px', color: '#e9edef', fontWeight: 'bold' }}>Choose layout</div>
                  <div style={{ display: 'flex', gap: '60px', alignItems: 'center' }}>
                    {selectedMergeLayout && (
                      <button
                        onClick={handleMergeUploadClick}
                        style={{
                          padding: '6px 10px',
                          backgroundColor: '#6366f1',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '8px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                          whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#4f46e5'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#6366f1'}
                      >
                        📤 UPLOAD
                      </button>
                    )}
                    {selectedMergeLayout && mergedImages.length > 0 && (
                      <button
                        onClick={() => setIsChangeImageMode(!isChangeImageMode)}
                        style={{
                          padding: '6px 10px',
                          backgroundColor: isChangeImageMode ? '#059669' : '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '8px',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                          whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
                        onMouseLeave={(e) => !isChangeImageMode && (e.target.style.backgroundColor = '#10b981')}
                      >
                        {isChangeImageMode ? '✓ MODE' : '📸 CHANGE'}
                      </button>
                    )}
                  </div>
                </div>
                <MergePanel
                  selectedLayout={selectedMergeLayout?.id}
                  onLayoutSelect={handleMergeLayoutSelect}
                  uploadButton={null}
                  changeButton={null}
                />
              </div>
          </div>
        )}
        {selectedFeature === 'quote' && (
          <div className="quote-panel-container" ref={quotePanelRef} onClick={(e) => e.stopPropagation()}>
            <div className="quote-panel-header">
              <h3>Choose Quote Design</h3>
            </div>
            <QuotePanel
              selectedDesign={selectedQuoteDesign}
              onDesignSelect={handleQuoteDesignSelect}
            />
          </div>
        )}
        {selectedFeature === 'filters' && (
          <div className="filter-panel">
            <PhotosFilterControls
              filters={filters}
              handleFilterChange={handleFilterChange}
              selectedFeature={selectedFeature}
              isCropping={false}
              onClose={() => setSelectedFeature(null)}
            />
          </div>
        )}
        {selectedFeature === 'brand' && (
          <TextFormattingPanel 
            selectedText={{
              brandName: brandName,
              fontFamily: brandFontFamily,
              fontSize: brandFontSize,
              color: brandColor,
              isBold: brandIsBold,
              isItalic: brandIsItalic,
              isUnderline: brandIsUnderline,
              isStrikethrough: brandIsStrikethrough,
              fill: brandFill,
              outlineColor: brandOutlineColor,
              outlineWidth: brandOutlineWidth,
              outlineStyle: brandOutlineStyle,
              shadowOffset: brandShadowOffset,
              shadowBlur: brandShadowBlur,
              shadowColor: brandShadowColor,
              glowIntensity: brandGlowIntensity,
              glowColor: brandGlowColor,
              letterSpacing: brandLetterSpacing,
              rotation: brandRotation,
            }}
            onUpdate={(updates) => {
              // Build brand updates to immediately apply
              const brandUpdates = {};
              
              if ('fontFamily' in updates) {
                setBrandFontFamily(updates.fontFamily);
                brandUpdates.fontFamily = updates.fontFamily;
              }
              if ('fontSize' in updates) {
                const size = parseInt(updates.fontSize);
                setBrandFontSize(size);
                brandUpdates.fontSize = size;
              }
              if ('brandName' in updates) {
                setBrandName(updates.brandName);
                brandUpdates.brandName = updates.brandName;
              }
              if ('color' in updates) {
                setBrandColor(updates.color);
                brandUpdates.color = updates.color;
              }
              if ('isBold' in updates) {
                setBrandIsBold(updates.isBold);
                brandUpdates.bold = updates.isBold;
              }
              if ('isItalic' in updates) {
                setBrandIsItalic(updates.isItalic);
                brandUpdates.italic = updates.isItalic;
              }
              if ('isUnderline' in updates) {
                setBrandIsUnderline(updates.isUnderline);
                brandUpdates.underline = updates.isUnderline ? 'underline' : 'none';
              }
              if ('isStrikethrough' in updates) {
                setBrandIsStrikethrough(updates.isStrikethrough);
                brandUpdates.strikethrough = updates.isStrikethrough;
              }
              if ('fill' in updates) {
                setBrandFill(updates.fill);
                brandUpdates.fill = updates.fill;
              }
              if ('outlineColor' in updates) {
                setBrandOutlineColor(updates.outlineColor);
                brandUpdates.outlineColor = updates.outlineColor;
              }
              if ('outlineWidth' in updates) {
                setBrandOutlineWidth(updates.outlineWidth);
                brandUpdates.outlineWidth = updates.outlineWidth;
              }
              if ('outlineStyle' in updates) {
                setBrandOutlineStyle(updates.outlineStyle);
                brandUpdates.outlineStyle = updates.outlineStyle;
              }
              if ('shadowOffset' in updates) {
                setBrandShadowOffset(updates.shadowOffset);
                brandUpdates.shadowOffset = updates.shadowOffset;
              }
              if ('shadowBlur' in updates) {
                setBrandShadowBlur(updates.shadowBlur);
                brandUpdates.shadowBlur = updates.shadowBlur;
              }
              if ('shadowColor' in updates) {
                setBrandShadowColor(updates.shadowColor);
                brandUpdates.shadowColor = updates.shadowColor;
              }
              if ('glowIntensity' in updates) {
                setBrandGlowIntensity(updates.glowIntensity);
                brandUpdates.glowIntensity = updates.glowIntensity;
              }
              if ('glowColor' in updates) {
                setBrandGlowColor(updates.glowColor);
                brandUpdates.glowColor = updates.glowColor;
              }
              if ('letterSpacing' in updates) {
                setBrandLetterSpacing(updates.letterSpacing);
                brandUpdates.letterSpacing = updates.letterSpacing;
              }
              if ('rotation' in updates) {
                setBrandRotation(updates.rotation);
                brandUpdates.rotation = updates.rotation;
              }
              if ('position' in updates) {
                setBrandPosition(updates.position);
                brandUpdates.position = updates.position;
              }
            }}
            onClose={() => setSelectedFeature(null)}
          />
        )}
        {(selectedFeature === 'text' || activeElement.type === 'text') && (
          <TextFormattingPanel 
            selectedText={{
              fontFamily: fontFamily,
              fontSize: selectedTextId ? texts.find(t => t.id === selectedTextId)?.fontSize || 40 : 40,
              color: textColor,
              isBold: textIsBold,
              isItalic: textIsItalic,
              isUnderline: textIsUnderline,
              isStrikethrough: textIsStrikethrough,
              fill: textFill,
              outlineColor: textOutlineColor,
              outlineWidth: textOutlineWidth,
              outlineStyle: textOutlineStyle,
              shadowOffset: textShadowOffset,
              shadowBlur: textShadowBlur,
              shadowColor: textShadowColor,
              glowIntensity: textGlowIntensity,
              glowColor: textGlowColor,
              letterSpacing: textLetterSpacing,
              rotation: textRotation,
            }}
            onUpdate={(updates) => {
              // Build text object updates to immediately apply to the selected text
              const textUpdates = {};
              
              if ('fontFamily' in updates) {
                setFontFamily(updates.fontFamily);
                textUpdates.fontFamily = updates.fontFamily;
              }
              if ('fontSize' in updates) {
                const size = parseInt(updates.fontSize);
                textUpdates.fontSize = size;
              }
              if ('color' in updates) {
                setTextColor(updates.color);
                textUpdates.color = updates.color;
              }
              if ('isBold' in updates) {
                setTextIsBold(updates.isBold);
                textUpdates.bold = updates.isBold;
              }
              if ('isItalic' in updates) {
                setTextIsItalic(updates.isItalic);
                textUpdates.italic = updates.isItalic;
              }
              if ('isUnderline' in updates) {
                setTextIsUnderline(updates.isUnderline);
                textUpdates.underline = updates.isUnderline ? 'underline' : 'none';
              }
              if ('isStrikethrough' in updates) {
                setTextIsStrikethrough(updates.isStrikethrough);
                textUpdates.strikethrough = updates.isStrikethrough;
              }
              if ('fill' in updates) {
                setTextFill(updates.fill);
                textUpdates.fill = updates.fill;
              }
              if ('outlineColor' in updates) {
                setTextOutlineColor(updates.outlineColor);
                textUpdates.outlineColor = updates.outlineColor;
              }
              if ('outlineWidth' in updates) {
                setTextOutlineWidth(updates.outlineWidth);
                textUpdates.outlineWidth = updates.outlineWidth;
              }
              if ('outlineStyle' in updates) {
                setTextOutlineStyle(updates.outlineStyle);
                textUpdates.outlineStyle = updates.outlineStyle;
              }
              if ('shadowOffset' in updates) {
                setTextShadowOffset(updates.shadowOffset);
                textUpdates.shadowOffset = updates.shadowOffset;
              }
              if ('shadowBlur' in updates) {
                setTextShadowBlur(updates.shadowBlur);
                textUpdates.shadowBlur = updates.shadowBlur;
              }
              if ('shadowColor' in updates) {
                setTextShadowColor(updates.shadowColor);
                textUpdates.shadowColor = updates.shadowColor;
              }
              if ('glowIntensity' in updates) {
                setTextGlowIntensity(updates.glowIntensity);
                textUpdates.glowIntensity = updates.glowIntensity;
              }
              if ('glowColor' in updates) {
                setTextGlowColor(updates.glowColor);
                textUpdates.glowColor = updates.glowColor;
              }
              if ('letterSpacing' in updates) {
                setTextLetterSpacing(updates.letterSpacing);
                textUpdates.letterSpacing = updates.letterSpacing;
              }
              if ('rotation' in updates) {
                setTextRotation(updates.rotation);
                textUpdates.rotation = updates.rotation;
              }
              
              // Apply updates to the selected text object immediately
              if (selectedTextId && Object.keys(textUpdates).length > 0) {
                setTexts(prev => prev.map(t => t.id === selectedTextId ? { ...t, ...textUpdates } : t));
              }
            }}
            hideNameInput={true}
            hideAdvancedControls={true}
            onClose={() => {
              if (activeElement.type === 'text') {
                setActiveElement({ type: null, id: null });
              } else {
                setSelectedFeature(null);
              }
            }}
          />
        )}
        {isCropping && (
          <div className="crop-panel-sidebar">
            <div className="crop-panel-header">
              <h3>Crop</h3>
              <span className="crop-header-dimensions">{cropArea ? `${Math.round(cropArea.width)} × ${Math.round(cropArea.height)}px` : 'Select area'}</span>
            </div>
            <div className="crop-panel-content">
              <div className="crop-panel-buttons">
                <button className="crop-cancel-btn" onClick={handleCropCancel}>
                  Cancel
                </button>
                <button className="crop-apply-btn" onClick={handleCropComplete}>
                  Crop
                </button>
              </div>
            </div>
          </div>
        )}
        <input
          ref={mergePhotoInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            Array.from(e.target.files || []).forEach((file) => {
              const reader = new FileReader();
              reader.onload = (event) => {
                setMergedImages(prev => [...prev, {
                  src: event.target.result,
                  fit: 'cover',
                  opacity: 100,
                }]);
              };
              reader.readAsDataURL(file);
            });
          }}
          style={{ display: 'none' }}
        />
        <input
          ref={changeImageInputRef}
          type="file"
          accept="image/*"
          onChange={handleChangeImageUpload}
          style={{ display: 'none' }}
        />
        <div className="download-button-wrapper">
          <PhotosDownload
              image={image}
              additionalImages={additionalImages}
              texts={texts}
              filters={filters}
              canvasRefs={canvasRefs}
              imageDimensions={imageDimensions}
              showScoreBox={showScoreBox}
              selectedFeature={selectedFeature}
              customMatchTime={customMatchTime}
              spokesperson={spokesperson}
              matchDateTime={matchDateTime}
              fontFamily={fontFamily}
              brandName={brandName}
              brandFontFamily={brandFontFamily}
              brandFontSize={brandFontSize}
              brandColor={brandColor}
              brandOutlineColor={brandOutlineColor}
              brandOutlineWidth={brandOutlineWidth}
              brandIsBold={brandIsBold}
              brandIsItalic={brandIsItalic}
              brandIsUnderline={brandIsUnderline}
              brandIsStrikethrough={brandIsStrikethrough}
              brandShadowOffset={brandShadowOffset}
              brandShadowBlur={brandShadowBlur}
              brandShadowColor={brandShadowColor}
              brandGlowIntensity={brandGlowIntensity}
              brandGlowColor={brandGlowColor}
              brandLetterSpacing={brandLetterSpacing}
              brandRotation={brandRotation}
              brandPosition={brandPosition}
              logos={logos}
              cropArea={cropArea}
              selectedQuoteDesign={selectedQuoteDesign}
              onSubscriptionModalOpen={onSubscriptionModalOpen}
            />
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
        <input ref={newPhotoInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
      </div>
    </div>
  );
};