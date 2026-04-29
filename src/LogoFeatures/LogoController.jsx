import React, { useRef, useEffect, useState } from 'react';
import { LogoArea } from './LogoArea';
import './LogoController.css';

export const LogoController = ({
  logo,
  isSelected,
  onSelect,
  onDeselect,
  onUpdate,
}) => {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isEdgeResizing, setIsEdgeResizing] = useState(false);
  const [edgeHandle, setEdgeHandle] = useState(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startRotation, setStartRotation] = useState(0);
  const [startScale, setStartScale] = useState(1);
  const [startScaleWidth, setStartScaleWidth] = useState(1);
  const [startScaleHeight, setStartScaleHeight] = useState(1);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [showHandles, setShowHandles] = useState(false);

  // Helper to get client position from mouse or touch event
  const getClientPos = (e) => {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    if (e.clientX !== undefined) {
      return { x: e.clientX, y: e.clientY };
    }
    return { x: 0, y: 0 };
  };

  // Handle main drag for moving logo (mouse and touch)
  const handleStartDrag = (e) => {
    const isTouchEvent = e.touches && e.touches.length > 0;
    const isMouseEvent = e.button === 0;
    
    if (!isTouchEvent && !isMouseEvent) return;
    if (e.target.closest('.resize-handle') || e.target.closest('.rotate-handle') || e.target.closest('.corner-circle-point') || e.target.closest('.edge-handle')) return;
    
    e.preventDefault();
    onSelect?.();
    setIsDragging(true);
    const pos = getClientPos(e);
    setStartPos(pos);
  };

  // Handle resize from corners and edges (mouse and touch)
  const handleStartResize = (e, handle) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect?.();
    setIsResizing(true);
    setResizeHandle(handle);
    const pos = getClientPos(e);
    setStartPos(pos);
    setStartScale(logo.scale || 1);
  };

  // Handle rotation (mouse and touch)
  const handleStartRotate = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect?.();
    setIsRotating(true);
    const pos = getClientPos(e);
    setStartPos(pos);
    setStartRotation(logo.rotation || 0);
  };

  // Handle edge resize for width/height (mouse and touch)
  const handleStartEdgeResize = (e, side) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect?.();
    setIsEdgeResizing(true);
    setEdgeHandle(side);
    const pos = getClientPos(e);
    setStartPos(pos);
    setStartScaleWidth(logo.scaleWidth || 1);
    setStartScaleHeight(logo.scaleHeight || 1);
  };

  // Global move handler for mouse and touch
  useEffect(() => {
    if (!isDragging && !isRotating && !isResizing && !isEdgeResizing) return;

    const handleMove = (e) => {
      const isTouchEvent = e.touches && e.touches.length > 0;
      let currentX, currentY;
      
      if (isTouchEvent) {
        currentX = e.touches[0].clientX;
        currentY = e.touches[0].clientY;
      } else {
        currentX = e.clientX;
        currentY = e.clientY;
      }

      if (isDragging) {
        const deltaX = currentX - startPos.x;
        const deltaY = currentY - startPos.y;
        onUpdate?.({
          ...logo,
          x: (logo.x || 0) + deltaX,
          y: (logo.y || 0) + deltaY,
        });
        setStartPos({ x: currentX, y: currentY });
      } else if (isRotating) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const angle1 = Math.atan2(startPos.y - centerY, startPos.x - centerX);
        const angle2 = Math.atan2(currentY - centerY, currentX - centerX);
        let angleDelta = ((angle2 - angle1) * 180) / Math.PI;
        
        onUpdate?.({
          ...logo,
          rotation: startRotation + angleDelta,
        });
      } else if (isResizing) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const startDistX = startPos.x - centerX;
        const startDistY = startPos.y - centerY;
        const startDistance = Math.sqrt(startDistX * startDistX + startDistY * startDistY);
        
        const currentDistX = currentX - centerX;
        const currentDistY = currentY - centerY;
        const currentDistance = Math.sqrt(currentDistX * currentDistX + currentDistY * currentDistY);
        
        const distanceDelta = currentDistance - startDistance;
        const scaleFactor = 1 + (distanceDelta / 300); // More sensitive resizing
        const newScale = Math.max(0.3, Math.min(3.5, startScale * scaleFactor)); // 30% to 350%
        
        onUpdate?.({
          ...logo,
          scale: newScale,
        });
      } else if (isEdgeResizing) {
        const deltaX = currentX - startPos.x;
        const deltaY = currentY - startPos.y;
        
        if (edgeHandle === 'right') {
          // Right edge: adjust width only with proper limit handling
          const widthFactor = 1 + (deltaX / 300);
          let newScaleWidth = startScaleWidth * widthFactor;
          // Clamp directly without secondary calculation
          newScaleWidth = newScaleWidth < 0.3 ? 0.3 : (newScaleWidth > 3.5 ? 3.5 : newScaleWidth);
          onUpdate?.({
            ...logo,
            scaleWidth: newScaleWidth,
          });
        } else if (edgeHandle === 'bottom') {
          // Bottom edge: adjust height only with proper limit handling
          const heightFactor = 1 + (deltaY / 300);
          let newScaleHeight = startScaleHeight * heightFactor;
          // Clamp directly without secondary calculation
          newScaleHeight = newScaleHeight < 0.3 ? 0.3 : (newScaleHeight > 3.5 ? 3.5 : newScaleHeight);
          onUpdate?.({
            ...logo,
            scaleHeight: newScaleHeight,
          });
        }
      }
      
      if (isTouchEvent) {
        e.preventDefault();
      }
    };

    const handleEnd = () => {
      setIsDragging(false);
      setIsRotating(false);
      setIsResizing(false);
      setIsEdgeResizing(false);
      setResizeHandle(null);
      setEdgeHandle(null);
      setStartScaleWidth(1);
      setStartScaleHeight(1);
    };

    document.addEventListener('mousemove', handleMove, { passive: false });
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);
    document.addEventListener('touchcancel', handleEnd);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchend', handleEnd);
      document.removeEventListener('touchcancel', handleEnd);
    };
  }, [isDragging, isRotating, isResizing, isEdgeResizing, startPos, startRotation, startScale, edgeHandle, logo, onUpdate]);

  // Wheel zoom support - More responsive scaling
  useEffect(() => {
    if (!isSelected) return;

    const handleWheel = (e) => {
      if (!containerRef.current?.contains(e.target)) return;
      e.preventDefault();
      
      // More responsive zoom: scroll down = smaller, scroll up = larger
      const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(0.3, Math.min(3.5, (logo.scale || 1) * scaleFactor));
      onUpdate?.({
        ...logo,
        scale: newScale,
      });
    };

    document.addEventListener('wheel', handleWheel, { passive: false });
    return () => document.removeEventListener('wheel', handleWheel);
  }, [isSelected, logo, onUpdate]);

  const transform = `translate(${logo.x || 0}px, ${logo.y || 0}px) rotate(${logo.rotation || 0}deg)`;
  const cursorStyle = isDragging ? 'grabbing' : 'grab';

  return (
    <div
      ref={containerRef}
      className={`logo-controller ${isSelected ? 'selected' : ''}`}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        transform,
        cursor: cursorStyle,
        userSelect: 'none',
        transition: isDragging || isRotating || isResizing || isEdgeResizing ? 'none' : 'transform 0.1s ease-out',
        touchAction: 'none',
      }}
      onMouseDown={handleStartDrag}
      onTouchStart={handleStartDrag}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      onTouchEnd={(e) => {
        e.stopPropagation();
      }}
    >
      {/* Logo Area Component */}
      <LogoArea
        logo={logo}
        isSelected={isSelected}
      />

      {/* Selection Border - Always show when selected */}
      {isSelected && (
        <div
          className="selection-border"
          style={{
            position: 'absolute',
            inset: '0',
            border: '2px solid #00dd77',
            borderRadius: '0px',
            pointerEvents: 'none',
            boxShadow: '0 0 8px rgba(0, 221, 119, 0.3)',
          }}
        />
      )}

      {/* Corner Circle Points - Always show when selected */}
      {isSelected && [
        { pos: 'tl', cursor: 'nwse-resize' },
        { pos: 'tr', cursor: 'nesw-resize' },
        { pos: 'bl', cursor: 'nesw-resize' },
        { pos: 'br', cursor: 'nwse-resize' },
      ].map(corner => (
        <div
          key={`corner-${corner.pos}`}
          className="corner-circle-point"
          data-handle={corner.pos}
          onMouseDown={(e) => handleStartResize(e, corner.pos)}
          onTouchStart={(e) => handleStartResize(e, corner.pos)}
          title={`${corner.pos.toUpperCase()} Resize`}
          style={{
            position: 'absolute',
            cursor: corner.cursor,
            userSelect: 'none',
            transition: 'background 0.15s ease, box-shadow 0.15s ease',
            opacity: 1,
            zIndex: 10,
            touchAction: 'none',
            background: isResizing && resizeHandle === corner.pos ? 'rgba(0, 221, 119, 0.5)' : 'white',
            boxShadow: isResizing && resizeHandle === corner.pos ? '0 0 6px rgba(0, 221, 119, 0.7)' : 'none',
          }}
        />
      ))}

      {/* Right Edge Handle - for width adjustment */}
      {isSelected && (
        <div
          className="edge-handle"
          data-side="right"
          onMouseDown={(e) => handleStartEdgeResize(e, 'right')}
          onTouchStart={(e) => handleStartEdgeResize(e, 'right')}
          title="Drag to adjust width"
          style={{
            position: 'absolute',
            right: '-2px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '6px',
            height: '18px',
            background: isEdgeResizing && edgeHandle === 'right' ? 'rgba(0, 221, 119, 0.5)' : '#ffffff',
            border: '1px solid #00dd77',
            cursor: 'ew-resize',
            borderRadius: '2px',
            boxShadow: isEdgeResizing && edgeHandle === 'right' ? '0 0 6px rgba(0, 221, 119, 0.7)' : 'none',
            userSelect: 'none',
            touchAction: 'none',
          }}
        />
      )}

      {/* Bottom Edge Handle - for height adjustment */}
      {isSelected && (
        <div
          className="edge-handle"
          data-side="bottom"
          onMouseDown={(e) => handleStartEdgeResize(e, 'bottom')}
          onTouchStart={(e) => handleStartEdgeResize(e, 'bottom')}
          title="Drag to adjust height"
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '-2px',
            transform: 'translateX(-50%)',
            width: '18px',
            height: '6px',
            background: isEdgeResizing && edgeHandle === 'bottom' ? 'rgba(0, 221, 119, 0.5)' : '#ffffff',
            border: '1px solid #00dd77',
            cursor: 'ns-resize',
            borderRadius: '2px',
            boxShadow: isEdgeResizing && edgeHandle === 'bottom' ? '0 0 6px rgba(0, 221, 119, 0.7)' : 'none',
            userSelect: 'none',
            touchAction: 'none',
          }}
        />
      )}

      {/* Connection Line from Logo Area to Rotation Handle */}
      {isSelected && (
        <div
          className="connection-line"
          style={{
            position: 'absolute',
            top: '-22px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '1px',
            height: '22px',
            backgroundColor: '#00dd77',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Rotation Handle */}
      {isSelected && (
        <div
          className="rotate-handle"
          onMouseDown={handleStartRotate}
          onTouchStart={handleStartRotate}
          title="Drag to rotate"
          style={{
            position: 'absolute',
            width: '8px',
            height: '8px',
            top: '-22px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: isRotating ? 'rgba(0, 221, 119, 0.3)' : '#ffffff',
            border: '1px solid #00dd77',
            borderRadius: '50%',
            cursor: 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '6px',
            fontWeight: 'bold',
            color: '#00dd77',
            boxShadow: isRotating ? '0 1px 3px rgba(0, 221, 119, 0.5)' : '0 1px 3px rgba(0, 0, 0, 0.2)',
            transition: 'background 0.15s ease, box-shadow 0.15s ease',
            userSelect: 'none',
            touchAction: 'none',
          }}
        >
          ↻
        </div>
      )}
    </div>
  );
};
