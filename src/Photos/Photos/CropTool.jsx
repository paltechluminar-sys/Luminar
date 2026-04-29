import React, { useState, useRef, useEffect, useCallback } from 'react';
import './CropTool.css';

export const CropTool = ({ 
  image, 
  imageDimensions, 
  onCropComplete, 
  onCancel,
  imageRef,
  cropArea: externalCropArea,
  onCropAreaChange
}) => {
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const parentRef = useRef(null);
  const lastTouchPosRef = useRef({ x: 0, y: 0 });
  
  const [scale, setScale] = useState(1);
  const [imgOffset, setImgOffset] = useState({ x: 0, y: 0 });
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });
  const [parentDimensions, setParentDimensions] = useState({ width: 0, height: 0 });

  const [cropArea, setCropArea] = useState(
    externalCropArea || {
      x: imageDimensions.width * 0.01,
      y: imageDimensions.height * 0.01,
      width: imageDimensions.width * 0.98,
      height: imageDimensions.height * 0.98,
    }
  );

  const [isDragging, setIsDragging] = useState(false);
  const [dragHandle, setDragHandle] = useState(null);
  const prevDimensionsRef = useRef(null);
  const isInternalChangeRef = useRef(false);

  // Initialize and reset crop area when image changes
  useEffect(() => {
    const { width, height } = imageDimensions;
    
    // First time or dimensions changed = new image
    if (!prevDimensionsRef.current || 
        prevDimensionsRef.current.width !== width || 
        prevDimensionsRef.current.height !== height) {
      
      prevDimensionsRef.current = { width, height };
      
      // Always reset to 98% coverage for new images
      setCropArea({
        x: width * 0.01,
        y: height * 0.01,
        width: width * 0.98,
        height: height * 0.98,
      });
    }
  }, [imageDimensions.width, imageDimensions.height]);

  // Sync with external crop area when deliberately set by parent
  useEffect(() => {
    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      return;
    }
    if (externalCropArea && externalCropArea.width > 0) {
      setCropArea(externalCropArea);
    }
  }, [externalCropArea]);

  // Notify parent of crop area changes
  useEffect(() => {
    if (onCropAreaChange) {
      isInternalChangeRef.current = true;
      onCropAreaChange(cropArea);
    }
  }, [cropArea]);

  // Update layout when image loads - measure from canvas area
  useEffect(() => {
    const updateLayout = () => {
      // Get the canvas-panel parent which defines the crop area
      const parent = document.querySelector('.canvas-panel');
      if (!parent) {
        setTimeout(updateLayout, 100);
        return;
      }

      // Find the image-container which holds the actual displayed image
      const imageContainer = parent.querySelector('.image-container');
      if (!imageContainer) {
        setTimeout(updateLayout, 100);
        return;
      }

      // Get the first img element (the main image being edited)
      const imgElement = imageContainer.querySelector('img');
      if (!imgElement || imgElement.naturalWidth === 0) {
        setTimeout(updateLayout, 100);
        return;
      }

      // Get bounding rectangles relative to viewport
      const imgRect = imgElement.getBoundingClientRect();
      const parentRect = parent.getBoundingClientRect();
      
      // Calculate position within the canvas-panel
      const relativeOffsetX = imgRect.left - parentRect.left;
      const relativeOffsetY = imgRect.top - parentRect.top;
      const displayWidth = imgRect.width;
      const displayHeight = imgRect.height;

      // Calculate scale factor
      if (displayWidth > 0 && displayHeight > 0) {
        const newScale = displayWidth / imageDimensions.width;
        setScale(newScale);
        setDisplaySize({ w: displayWidth, h: displayHeight });
        setImgOffset({ x: relativeOffsetX, y: relativeOffsetY });
      }
    };

    // Wait for layout to stabilize
    const timer = setTimeout(updateLayout, 250);
    updateLayout();
    
    window.addEventListener('resize', updateLayout);
    
    const resizeObserver = new ResizeObserver(updateLayout);
    const panel = document.querySelector('.canvas-panel');
    if (panel) {
      resizeObserver.observe(panel);
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateLayout);
      resizeObserver.disconnect();
    };
  }, [imageDimensions]);

  const constrainCropArea = (area) => {
    const minSize = 30;
    return {
      x: Math.max(0, Math.min(area.x, imageDimensions.width - minSize)),
      y: Math.max(0, Math.min(area.y, imageDimensions.height - minSize)),
      width: Math.max(minSize, Math.min(area.width, imageDimensions.width - area.x)),
      height: Math.max(minSize, Math.min(area.height, imageDimensions.height - area.y)),
    };
  };

  // Helper to process drag movement for both mouse and touch
  const processDragMovement = (movementX, movementY, dragHdl) => {
    setCropArea(prevArea => {
      let newArea = { ...prevArea };

      if (dragHdl === 'move') {
        newArea.x += movementX;
        newArea.y += movementY;
      } else if (dragHdl === 'nw') {
        newArea.x += movementX;
        newArea.y += movementY;
        newArea.width -= movementX;
        newArea.height -= movementY;
      } else if (dragHdl === 'ne') {
        newArea.y += movementY;
        newArea.width += movementX;
        newArea.height -= movementY;
      } else if (dragHdl === 'sw') {
        newArea.x += movementX;
        newArea.width -= movementX;
        newArea.height += movementY;
      } else if (dragHdl === 'se') {
        newArea.width += movementX;
        newArea.height += movementY;
      } else if (dragHdl === 'n') {
        newArea.y += movementY;
        newArea.height -= movementY;
      } else if (dragHdl === 's') {
        newArea.height += movementY;
      } else if (dragHdl === 'w') {
        newArea.x += movementX;
        newArea.width -= movementX;
      } else if (dragHdl === 'e') {
        newArea.width += movementX;
      }

      return constrainCropArea(newArea);
    });
  };

  const handleMouseDown = useCallback((e, handle) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragHandle(handle);
    lastTouchPosRef.current = { x: e.clientX, y: e.clientY };
  }, []);

  // Touch event handlers for mobile
  const handleTouchStart = useCallback((e, handle) => {
    e.preventDefault();
    e.stopPropagation();
    const touch = e.touches[0];
    setIsDragging(true);
    setDragHandle(handle);
    lastTouchPosRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    const onMouseMove = (e) => {
      const movementX = (e.clientX - lastTouchPosRef.current.x) / (scale || 1);
      const movementY = (e.clientY - lastTouchPosRef.current.y) / (scale || 1);
      lastTouchPosRef.current = { x: e.clientX, y: e.clientY };
      processDragMovement(movementX, movementY, dragHandle);
    };

    const onMouseUp = () => {
      setIsDragging(false);
      setDragHandle(null);
    };

    const onTouchMove = (e) => {
      if (!dragHandle) return;
      const touch = e.touches[0];
      const movementX = (touch.clientX - lastTouchPosRef.current.x) / (scale || 1);
      const movementY = (touch.clientY - lastTouchPosRef.current.y) / (scale || 1);
      lastTouchPosRef.current = { x: touch.clientX, y: touch.clientY };
      processDragMovement(movementX, movementY, dragHandle);
    };

    const onTouchEnd = () => {
      setIsDragging(false);
      setDragHandle(null);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, dragHandle, scale]);

  // Convert crop area to display coordinates - with safety checks
  const displayCrop = {
    x: Math.max(0, (cropArea?.x || 0) * (scale || 0) + (imgOffset?.x || 0)),
    y: Math.max(0, (cropArea?.y || 0) * (scale || 0) + (imgOffset?.y || 0)),
    width: Math.max(30, (cropArea?.width || imageDimensions.width * 0.98) * (scale || 1)),
    height: Math.max(30, (cropArea?.height || imageDimensions.height * 0.98) * (scale || 1)),
  };

  return (
    <div 
      ref={containerRef}
      className="crop-tool-overlay" 
      style={{ 
        position: 'absolute', 
        inset: 0,
        width: '100%', 
        height: '100%', 
        zIndex: 999,
        overflow: 'visible',
        display: 'block',
        pointerEvents: 'auto',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        clipPath: 'none',
      }}>
        {/* Darkened overlays - Top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: `${displayCrop.y}px`,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            pointerEvents: 'none',
          }}
        />

        {/* Darkened overlays - Bottom */}
        <div
          style={{
            position: 'absolute',
            top: `${displayCrop.y + displayCrop.height}px`,
            left: 0,
            width: '100%',
            height: `calc(100% - ${displayCrop.y + displayCrop.height}px)`,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            pointerEvents: 'none',
          }}
        />

        {/* Darkened overlays - Left */}
        <div
          style={{
            position: 'absolute',
            top: `${displayCrop.y}px`,
            left: 0,
            width: `${displayCrop.x}px`,
            height: `${displayCrop.height}px`,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            pointerEvents: 'none',
          }}
        />

        {/* Darkened overlays - Right */}
        <div
          style={{
            position: 'absolute',
            top: `${displayCrop.y}px`,
            left: `${displayCrop.x + displayCrop.width}px`,
            width: `calc(100% - ${displayCrop.x + displayCrop.width}px)`,
            height: `${displayCrop.height}px`,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            pointerEvents: 'none',
          }}
        />

        {/* Crop Frame */}
        <div
          className="crop-frame"
          style={{
            position: 'absolute',
            left: `${displayCrop.x}px`,
            top: `${displayCrop.y}px`,
            width: `${displayCrop.width}px`,
            height: `${displayCrop.height}px`,
            cursor: isDragging ? 'grabbing' : 'grab',
            border: '2px solid #00d9ff',
            boxSizing: 'border-box',
            pointerEvents: 'auto',
            overflow: 'visible',
            clipPath: 'none',
            contain: 'none',
            willChange: 'transform',
          }}
          onMouseDown={(e) => handleMouseDown(e, 'move')}
          onTouchStart={(e) => handleTouchStart(e, 'move')}
        >
          {/* Grid lines - 5x5 */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
            }}
          >
            <div style={{ position: 'absolute', width: '100%', height: '20%', borderBottom: '1px solid rgba(0, 217, 255, 0.4)', top: 0 }} />
            <div style={{ position: 'absolute', width: '100%', height: '40%', borderBottom: '1px solid rgba(0, 217, 255, 0.4)', top: 0 }} />
            <div style={{ position: 'absolute', width: '100%', height: '60%', borderBottom: '1px solid rgba(0, 217, 255, 0.4)', top: 0 }} />
            <div style={{ position: 'absolute', width: '100%', height: '80%', borderBottom: '1px solid rgba(0, 217, 255, 0.4)', top: 0 }} />
            <div style={{ position: 'absolute', height: '100%', width: '20%', borderRight: '1px solid rgba(0, 217, 255, 0.4)', left: 0 }} />
            <div style={{ position: 'absolute', height: '100%', width: '40%', borderRight: '1px solid rgba(0, 217, 255, 0.4)', left: 0 }} />
            <div style={{ position: 'absolute', height: '100%', width: '60%', borderRight: '1px solid rgba(0, 217, 255, 0.4)', left: 0 }} />
            <div style={{ position: 'absolute', height: '100%', width: '80%', borderRight: '1px solid rgba(0, 217, 255, 0.4)', left: 0 }} />
          </div>

          {/* Corner handles */}
          <div
            className="crop-handle crop-handle-nw"
            onMouseDown={(e) => handleMouseDown(e, 'nw')}
            onTouchStart={(e) => handleTouchStart(e, 'nw')}
          />
          <div
            className="crop-handle crop-handle-ne"
            onMouseDown={(e) => handleMouseDown(e, 'ne')}
            onTouchStart={(e) => handleTouchStart(e, 'ne')}
          />
          <div
            className="crop-handle crop-handle-sw"
            onMouseDown={(e) => handleMouseDown(e, 'sw')}
            onTouchStart={(e) => handleTouchStart(e, 'sw')}
          />
          <div
            className="crop-handle crop-handle-se"
            onMouseDown={(e) => handleMouseDown(e, 'se')}
            onTouchStart={(e) => handleTouchStart(e, 'se')}
          />

          {/* Edge handles */}
          <div
            className="crop-handle crop-handle-n"
            onMouseDown={(e) => handleMouseDown(e, 'n')}
            onTouchStart={(e) => handleTouchStart(e, 'n')}
          />
          <div
            className="crop-handle crop-handle-s"
            onMouseDown={(e) => handleMouseDown(e, 's')}
            onTouchStart={(e) => handleTouchStart(e, 's')}
          />
          <div
            className="crop-handle crop-handle-w"
            onMouseDown={(e) => handleMouseDown(e, 'w')}
            onTouchStart={(e) => handleTouchStart(e, 'w')}
          />
          <div
            className="crop-handle crop-handle-e"
            onMouseDown={(e) => handleMouseDown(e, 'e')}
            onTouchStart={(e) => handleTouchStart(e, 'e')}
          />
        </div>
    </div>
  );
};
