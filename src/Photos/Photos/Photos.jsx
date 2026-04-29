import React, { useState, useCallback, useRef } from 'react';
import './Sports.css';
import { SportsCanvas } from './SportsCanvas';
import { SportsControls } from './SportsControls';
import { SportsDownload } from './SportsDownload';
import { measureTextWidth, getImageCenter, getCenteredTextPosition, restrictToBounds, loadImage, throttleEvent } from '../Sports/SportsUtils';
import { FONT_FAMILIES, TEXT_COLORS, UNDERLINE_STYLES } from './SportsConstants';


export const Sports = ({ initialImage }) => {
  const [image, setImage] = useState(initialImage || null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [texts, setTexts] = useState([]);
  const [logos, setLogos] = useState([]);
  const [imageDimensions, setImageDimensions] = useState({ width: 500, height: 281.25 });
  const [activeElement, setActiveElement] = useState({ type: null, id: null });
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [fontFamily, setFontFamily] = useState('Impact');
  const [textColor, setTextColor] = useState(TEXT_COLORS[1].value);
  const [strokeColor, setStrokeColor] = useState(TEXT_COLORS[1].value);
  const [textStyles, setTextStyles] = useState({
    bold: false,
    italic: false,
    underline: 'none',
  });
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isRotating, setIsRotating] = useState(false);
  const [rotationStartAngle, setRotationStartAngle] = useState(0);
  const [rotationCenter, setRotationCenter] = useState({ x: 0, y: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [initialDistance, setInitialDistance] = useState(null);
  const [initialFontSize, setInitialFontSize] = useState(40);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    grayscale: 0,
    sepia: 0,
    blur: 0,
  });
  const [canvasRefs, setCanvasRefs] = useState({ canvasRef: null, imageRef: null, additionalImageRefs: [] });

  const textInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target.result);
      setAdditionalImages([]);
      setTexts([]);
      setLogos([]);
      setActiveElement({ type: null, id: null });
      setSelectedFeature(null);
      setFilters({
        brightness: 100,
        contrast: 100,
        saturation: 100,
        grayscale: 0,
        sepia: 0,
        blur: 0,
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleAdditionalImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file || additionalImages.length >= 3) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setAdditionalImages((prev) => [...prev, event.target.result]);
    };
    reader.readAsDataURL(file);
  }, [additionalImages.length]);

  React.useEffect(() => {
    if (initialImage) {
      setImage(initialImage);
    }
  }, [initialImage]);

  const updateText = useCallback((id, updates) => {
    setTexts((prev) => prev.map((text) => (text.id === id ? { ...text, ...updates } : text)));
  }, []);

  const updateTextProperties = useCallback((id, updates) => {
    setTexts((prev) => prev.map((text) => (text.id === id ? { ...text, ...updates } : text)));
  }, [setTexts]);

  const updateLogo = useCallback((id, updates) => {
    setLogos((prev) => prev.map((logo) => (logo.id === id ? { ...logo, ...updates } : logo)));
  }, []);

  const addText = useCallback(() => {
    const { x, y } = getCenteredTextPosition(canvasRefs.canvasRef || canvasRefs.imageRef);
    const newText = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'Tap to edit',
      x,
      y,
      fontFamily,
      fontSize: 16,
      color: '#FFFFFF',
      stroke: strokeColor,
      rotation: 0,
      bold: textStyles.bold,
      italic: textStyles.italic,
      underline: textStyles.underline,
      width: 0, // Initialize width
      height: 0, // Initialize height
    };
    const textWidth = measureTextWidth(newText.content, newText.fontSize, newText.fontFamily, newText.bold, newText.italic);
    const { x: boundedX, y: boundedY } = restrictToBounds('text', newText.id, newText.x, y, textWidth, newText.fontSize, 0, canvasRefs.canvasRef || canvasRefs.imageRef, []);
    setTexts((prev) => [...prev, { ...newText, x: boundedX, y: boundedY, width: textWidth, height: newText.fontSize }]);
    setActiveElement({ type: 'text', id: newText.id });
    setSelectedFeature('text');
    setIsEditing(true);
  }, [fontFamily, strokeColor, textStyles, canvasRefs, additionalImages.length]);

  const addLogo = useCallback((logoSrc) => {
    if (!logoSrc) return;
    
    const { x, y } = getCenteredTextPosition(canvasRefs.canvasRef || canvasRefs.imageRef);
    const newLogo = {
      id: `logo-${Date.now()}`,
      type: 'logo',
      src: logoSrc,
      x,
      y,
      scale: 1,
      rotation: 0,
      opacity: 1,
      width: 100,
      height: 100,
    };
    setLogos((prev) => [...prev, newLogo]);
    setActiveElement({ type: 'logo', id: newLogo.id });
    setSelectedFeature('logo');
  }, [canvasRefs]);

  const deleteElement = useCallback(() => {
    if (!activeElement.id) return;

    switch (activeElement.type) {
      case 'text':
        setTexts((prev) => prev.filter((text) => text.id !== activeElement.id));
        break;
      case 'logo':
        setLogos((prev) => prev.filter((logo) => logo.id !== activeElement.id));
        break;
      default:
        return;
    }

    setActiveElement({ type: null, id: null });
    setSelectedFeature(null);
  }, [activeElement]);

  const handleElementClick = useCallback(
    (type, id, e) => {
      e.stopPropagation();
      setActiveElement({ type, id });
      setSelectedFeature(type);

      const element = type === 'text' ? texts.find((t) => t.id === id) : null;

      if (!element) return;

      if (type === 'text') {
        setTextStyles({
          bold: element.bold || false,
          italic: element.italic || false,
          underline: element.underline || 'none',
        });
        setTextColor(element.color || TEXT_COLORS[1].value);
        setStrokeColor(element.stroke || TEXT_COLORS[1].value);
        setFontFamily(element.fontFamily || 'Impact');
      }
    },
    [texts]
  );

  const handleDoubleClick = useCallback(
    (type, id, e) => {
      e.stopPropagation();
      if (type === 'text') {
        setActiveElement({ type, id });
        setSelectedFeature(type);
        setIsEditing(true);
      }
    },
    []
  );

  const handleStartLongPress = useCallback(
    (type, id, e) => {
      e.stopPropagation();
      const timer = setTimeout(() => {
        if (type === 'text') {
          setIsEditing(true);
        }
      }, 500);
      setLongPressTimer(timer);
    },
    []
  );

  const handleCancelLongPress = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  const handleStartDragging = useCallback(
    (type, id, e) => {
      e.stopPropagation();
      e.preventDefault();
      setDragging(true);

      const element = type === 'text' ? texts.find((t) => t.id === id) : null;

      if (!element) return;

      const clientX = e.clientX || (e.touches?.[0]?.clientX) || 0;
      const clientY = e.clientY || (e.touches?.[0]?.clientY) || 0;

      const width =
        type === 'text'
          ? element.width || measureTextWidth(element.content, element.fontSize, element.fontFamily, element.bold, element.italic)
          : element.width || 100;

      const height =
        type === 'text'
          ? element.height || element.fontSize || 40
          : element.height || 100;

      const { x, y } = restrictToBounds(type, id, element.x, element.y, width, height, element.rotation, canvasRefs.canvasRef || canvasRefs.imageRef, []);
      setDragOffset({ x: clientX - x, y: clientY - y });
    },
    [texts, canvasRefs]
  );

  const handleDrag = useCallback(
    throttleEvent((e) => {
      if (!dragging || !activeElement.id) return;
      e.preventDefault();

      const clientX = e.clientX || (e.touches?.[0]?.clientX) || 0;
      const clientY = e.clientY || (e.touches?.[0]?.clientY) || 0;

      const newX = clientX - dragOffset.x;
      const newY = clientY - dragOffset.y;

      const element = activeElement.type === 'text' ? texts.find((t) => t.id === activeElement.id) : null;

      if (!element) return;

      const width =
        activeElement.type === 'text'
          ? element.width || measureTextWidth(element.content, element.fontSize, element.fontFamily, element.bold, element.italic)
          : element.width || 100;

      const height =
        activeElement.type === 'text'
          ? element.height || element.fontSize || 40
          : element.height || 100;

      const { x, y } = restrictToBounds(activeElement.type, activeElement.id, newX, newY, width, height, element.rotation, canvasRefs.canvasRef || canvasRefs.imageRef, []);

      const updater = activeElement.type === 'text' ? updateText : null;

      if (updater) {
        updater(activeElement.id, { x, y });
      }
    }, 8),
    [dragging, activeElement, dragOffset, texts, updateText, canvasRefs]
  );

  const handleStopDragging = useCallback(() => {
    setDragging(false);
  }, []);

  const handleStartRotation = useCallback(
    (type, id, e) => {
      e.stopPropagation();
      e.preventDefault();
      handleCancelLongPress();
      setIsRotating(true);

      const element = type === 'text' ? texts.find((t) => t.id === id) : null;

      if (!element) return;

      setRotationCenter({ x: element.x, y: element.y });
      const clientX = e.clientX || (e.touches?.[0]?.clientX) || 0;
      const clientY = e.clientY || (e.touches?.[0]?.clientY) || 0;
      const dx = clientX - element.x;
      const dy = clientY - element.y;
      setRotationStartAngle(Math.atan2(dy, dx) * (180 / Math.PI) - (element.rotation || 0));
    },
    [texts, handleCancelLongPress]
  );

  const handleRotation = useCallback(
    throttleEvent((e) => {
      if (!isRotating || !activeElement.id) return;
      e.preventDefault();

      const clientX = e.clientX || (e.touches?.[0]?.clientX) || 0;
      const clientY = e.clientY || (e.touches?.[0]?.clientY) || 0;
      const dx = clientX - rotationCenter.x;
      const dy = clientY - rotationCenter.y;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      const newRotation = angle - rotationStartAngle;

      const updater = updateText;

      updater(activeElement.id, { rotation: newRotation });
    }, 8),
    [isRotating, activeElement, rotationCenter, rotationStartAngle, updateText]
  );

  const handleStopRotation = useCallback(() => {
    setIsRotating(false);
  }, []);

  const handleMouseWheelRotation = useCallback(
    (e) => {
      if (e.ctrlKey && activeElement.id) {
        e.preventDefault();
        const rotationDelta = e.deltaY * 0.2;

        const updater = updateText;

        const element = activeElement.type === 'text' ? texts.find((t) => t.id === activeElement.id) : null;

        if (!element) return;

        const newRotation = (element.rotation || 0) - rotationDelta;
        updater(activeElement.id, { rotation: newRotation });
      }
    },
    [activeElement, texts, updateText]
  );

  const handleTextZoom = useCallback(
    throttleEvent((id, e) => {
      if (activeElement.type !== 'text' || activeElement.id !== id) return;
      const delta = e.deltaY || 0;
      const text = texts.find((t) => t.id === id);
      if (!text) return;

      const newFontSize = Math.min(Math.max(text.fontSize - delta * 0.5, 10), 200);
      const textWidth = measureTextWidth(text.content, newFontSize, text.fontFamily, text.bold, text.italic);
      const { x, y } = restrictToBounds('text', id, text.x, text.y, textWidth, newFontSize, text.rotation, canvasRefs.canvasRef || canvasRefs.imageRef, []);
      updateText(id, { fontSize: newFontSize, x, y, width: textWidth, height: newFontSize });
    }, 10),
    [activeElement, texts, updateText, canvasRefs]
  );

  const handleTouchZoom = useCallback(
    (type, id, e) => {
      if (e.touches.length === 2) {
        e.preventDefault();

        const element = type === 'text' ? texts.find((t) => t.id === id) : null;

        if (!element) return;

        setInitialFontSize(type === 'text' ? element.fontSize : element.width || 100);

        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
        setInitialDistance(dist);
      }
    },
    [texts]
  );

  const handleTouchMove = useCallback(
    throttleEvent((e) => {
      if (initialDistance !== null && e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
        const scale = currentDistance / initialDistance;
        const newSize = Math.min(Math.max(initialFontSize * scale, 10), 500);

        const updater = activeElement.type === 'text' ? updateText : null;

        if (!updater || !activeElement.id) return;

        const element = activeElement.type === 'text' ? texts.find((t) => t.id === activeElement.id) : null;

        if (!element) return;

        if (activeElement.type === 'text') {
          const textWidth = measureTextWidth(element.content, newSize, element.fontFamily, element.bold, element.italic);
          const { x, y } = restrictToBounds('text', activeElement.id, element.x, element.y, textWidth, newSize, element.rotation, canvasRefs.canvasRef || canvasRefs.imageRef, []);
          updateText(activeElement.id, { fontSize: newSize, x, y, width: textWidth, height: newSize });
        }
      } else if (e.touches.length === 1) {
        handleDrag(e);
      }
    }, 8),
    [initialDistance, initialFontSize, activeElement, updateText, handleDrag, canvasRefs, texts]
  );

  const handleTouchEnd = useCallback(() => {
    setInitialDistance(null);
    handleStopDragging();
    handleStopRotation();
    handleCancelLongPress();
  }, [handleStopDragging, handleStopRotation, handleCancelLongPress]);

  const handleTextBlur = useCallback(
    (id, e) => {
      const newContent = e.target.value || 'Tap to edit';
      updateText(id, { content: newContent, color: newContent === 'Tap to edit' ? '#FF0000' : textColor });
      setIsEditing(false);
    },
    [updateText, textColor]
  );

  const handleTextKeyDown = useCallback(
    (id, e) => {
      if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();
        const newContent = e.target.value || 'Tap to edit';
        updateText(id, { content: newContent, color: newContent === 'Tap to edit' ? '#FF0000' : textColor });
        setIsEditing(false);
      }
    },
    [updateText, textColor]
  );

  const toggleTextStyle = useCallback(
    (style, value) => {
      if (style === 'underline') {
        setTextStyles((prev) => ({ ...prev, [style]: value }));
        if (activeElement.type === 'text' && activeElement.id) {
          updateText(activeElement.id, { [style]: value });
        }
      } else {
        const newValue = !textStyles[style];
        setTextStyles((prev) => ({ ...prev, [style]: newValue }));
        if (activeElement.type === 'text' && activeElement.id) {
          updateText(activeElement.id, { [style]: newValue });
        }
      }
    },
    [activeElement, textStyles, updateText]
  );

  const handleFilterChange = useCallback((filterName, value) => {
    setFilters((prev) => ({ ...prev, [filterName]: parseInt(value) }));
  }, []);

  const handleTextColorChange = useCallback(
    (e) => {
      const newColor = e.target.value;
      setTextColor(newColor);
      if (activeElement.type === 'text' && activeElement.id && selectedFeature === 'text') {
        updateText(activeElement.id, { color: newColor });
      }
    },
    [activeElement, selectedFeature, updateText]
  );

  const handleStrokeColorChange = useCallback(
    (e) => {
      const newStroke = e.target.value;
      setStrokeColor(newStroke);
      if (activeElement.type === 'text' && activeElement.id && selectedFeature === 'text') {
        updateText(activeElement.id, { stroke: newStroke });
      }
    },
    [activeElement, selectedFeature, updateText]
  );

  const handleFontFamilyChange = useCallback(
    (e) => {
      const newFont = e.target.value;
      setFontFamily(newFont);
      if (activeElement.type === 'text' && activeElement.id && selectedFeature === 'text') {
        updateText(activeElement.id, { fontFamily: newFont });
      }
    },
    [activeElement, selectedFeature, updateText]
  );



  return (
    <div className="sports-editor">
      <div className="editor-container">
        <SportsControls
          addText={addText}
          addLogo={addLogo}
          deleteElement={deleteElement}
          handleFilterChange={handleFilterChange}
          selectedFeature={selectedFeature}
          setSelectedFeature={setSelectedFeature}
          activeElement={activeElement}
          fontFamily={fontFamily}
          handleFontFamilyChange={handleFontFamilyChange}
          textColor={textColor}
          handleTextColorChange={handleTextColorChange}
          strokeColor={strokeColor}
          handleStrokeColorChange={handleStrokeColorChange}
          textStyles={textStyles}
          toggleTextStyle={toggleTextStyle}
          filters={filters}
          handleImageUpload={handleImageUpload}
          newPhotoInputRef={fileInputRef}

        />
        <div className="canvas-panel">
          <SportsCanvas
            image={image}
          additionalImages={additionalImages}
          setAdditionalImages={setAdditionalImages}
          handleAdditionalImageUpload={handleAdditionalImageUpload}
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
          fontInfo={fontFamily} // Renamed to fontInfo to match SportsCanvas
          handleDrag={handleDrag}
          handleTouchMove={handleTouchMove}
          handleTouchEnd={handleTouchEnd}
          handleMouseWheelRotation={handleMouseWheelRotation}
          handleTextZoom={handleTextZoom}
          startDragging={handleStartDragging}
          stopDragging={handleStopDragging}
          startRotation={handleStartRotation}
          handleRotation={handleRotation}
          stopRotation={handleStopRotation}
          handleElementClick={handleElementClick}
          handleDoubleClick={handleDoubleClick}
          startLongPress={handleStartLongPress}
          handleTextBlur={handleTextBlur}
          handleTextKeyDown={handleTextKeyDown}
          handleTouchZoom={handleTouchZoom}
          setImage={setImage}
          setCanvasRefs={setCanvasRefs}
          updateText={updateText}
          updateTextProperties={updateTextProperties} // Added new prop
          textInputRef={textInputRef}
          selectedFeature={selectedFeature}
          handleImageUpload={handleImageUpload}
          fileInputRef={fileInputRef}
          setImageDimensions={setImageDimensions}
        />
        </div>
        <SportsDownload
          image={image}
          additionalImages={additionalImages}
          texts={texts}
          logos={logos}
          filters={filters}
          canvasRefs={canvasRefs}
          imageDimensions={imageDimensions}
          selectedFeature={selectedFeature}
          fontFamily={fontFamily}
        />
      </div>
    </div>
  );
}; 