import React, { useRef, useEffect, useState } from 'react';
import { TextArea } from './TextArea';
import './TextController.css';

export const TextController = ({
  text,
  isSelected,
  onSelect,
  onDeselect,
  onUpdate,
  onContentChange,
  maxWidth = null,
}) => {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isMarginResizing, setIsMarginResizing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startRotation, setStartRotation] = useState(0);
  const [startScale, setStartScale] = useState(1);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [marginHandle, setMarginHandle] = useState(null);
  const [startMarginLeft, setStartMarginLeft] = useState(0);
  const [startMarginRight, setStartMarginRight] = useState(0);
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

  // Handle main drag for moving text (mouse and touch)
  const handleStartDrag = (e) => {
    const isTouchEvent = e.touches && e.touches.length > 0;
    const isMouseEvent = e.button === 0;
    
    if (!isTouchEvent && !isMouseEvent) return;
    if (e.target.closest('.resize-handle') || e.target.closest('.rotate-handle') || e.target.closest('.corner-circle-point') || e.target.closest('.margin-handle')) return;
    
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
    setStartScale(text.scale || 1);
  };

  // Handle rotation (mouse and touch)
  const handleStartRotate = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onSelect?.();
    setIsRotating(true);
    const pos = getClientPos(e);
    setStartPos(pos);
    setStartRotation(text.rotation || 0);
  };

  // Handle margin resize (left and right) - mouse and touch
  const handleStartMarginResize = (e, side) => {
    console.log('🎯 Margin resize START:', { side, type: e.type, isTouchEvent: !!e.touches });
    e.stopPropagation();
    e.preventDefault();
    onSelect?.();
    setIsMarginResizing(true);
    setMarginHandle(side);
    const pos = getClientPos(e);
    setStartPos(pos);
    setStartMarginLeft(text.marginLeft || 0);
    setStartMarginRight(text.marginRight || 0);
    console.log('🎯 Margin resize initialized:', { side, pos, marginLeft: text.marginLeft, marginRight: text.marginRight });
  };

  // Global move handler for mouse and touch
  useEffect(() => {
    if (!isDragging && !isRotating && !isResizing && !isMarginResizing) return;

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
          ...text,
          x: (text.x || 0) + deltaX,
          y: (text.y || 0) + deltaY,
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
          ...text,
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
        const scaleFactor = 1 + (distanceDelta / 500);
        const newScale = Math.max(0.3, Math.min(6, startScale * scaleFactor));
        
        onUpdate?.({
          ...text,
          scale: newScale,
        });
      } else if (isMarginResizing) {
        const deltaX = currentX - startPos.x;
        
        if (marginHandle === 'left') {
          const newMarginLeft = Math.max(0, startMarginLeft + deltaX);
          console.log('📐 Left margin drag:', { deltaX, startMarginLeft, newMarginLeft });
          onUpdate?.({
            ...text,
            marginLeft: newMarginLeft,
          });
        } else if (marginHandle === 'right') {
          const newMarginRight = Math.max(0, startMarginRight - deltaX);
          console.log('📐 Right margin drag:', { deltaX, startMarginRight, newMarginRight });
          onUpdate?.({
            ...text,
            marginRight: newMarginRight,
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
      setIsMarginResizing(false);
      setResizeHandle(null);
      setMarginHandle(null);
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
  }, [isDragging, isRotating, isResizing, isMarginResizing, startPos, startRotation, startScale, marginHandle, startMarginLeft, startMarginRight, text, onUpdate]);

  // Wheel zoom support
  useEffect(() => {
    if (!isSelected) return;

    const handleWheel = (e) => {
      if (!containerRef.current?.contains(e.target)) return;
      e.preventDefault();
      
      const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(0.3, Math.min(6, (text.scale || 1) * scaleFactor));
      onUpdate?.({
        ...text,
        scale: newScale,
      });
    };

    document.addEventListener('wheel', handleWheel, { passive: false });
    return () => document.removeEventListener('wheel', handleWheel);
  }, [isSelected, text, onUpdate]);

  const transform = `translate(${text.x || 0}px, ${text.y || 0}px) rotate(${text.rotation || 0}deg) scale(${text.scale || 1})`;
  const cursorStyle = isDragging ? 'grabbing' : 'grab';

  const handleEditStart = () => {
    onSelect?.();
    setIsEditing(true);
  };

  const handleEditEnd = () => {
    setIsEditing(false);
    onDeselect?.();
  };

  const handleTextChange = (newContent) => {
    onContentChange?.(newContent);
  };

  return (
    <div
      ref={containerRef}
      className={`text-controller ${isSelected ? 'selected' : ''} ${isEditing ? 'editing' : ''}`}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        transform,
        cursor: cursorStyle,
        userSelect: 'none',
        transition: isDragging || isRotating || isResizing || isEditing ? 'none' : 'transform 0.1s ease-out',
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
      {/* Text Area Component */}
      <TextArea
        text={text}
        isSelected={isSelected}
        isEditing={isEditing}
        onTextChange={handleTextChange}
        onEditStart={handleEditStart}
        onEditEnd={handleEditEnd}
        maxWidth={maxWidth}
      />

      {/* Selection Border - Always show when selected */}
      {isSelected && (
        <div
          className="selection-border"
          style={{
            position: 'absolute',
            inset: '0',
            border: '1px solid #00dd77',
            borderRadius: '0px',
            pointerEvents: 'none',
            boxShadow: 'none',
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

      {/* Right Margin Handle */}
      {isSelected && (
        <div
          className="margin-handle"
          data-side="right"
          onMouseDown={(e) => handleStartMarginResize(e, 'right')}
          onTouchStart={(e) => handleStartMarginResize(e, 'right')}
          title="Drag right margin"
          style={{
            position: 'absolute',
            right: '-2px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: isMarginResizing ? 'rgba(0, 221, 119, 0.5)' : '#ffffff',
            boxShadow: isMarginResizing ? '0 0 6px rgba(0, 221, 119, 0.7)' : 'none',
          }}
        />
      )}

      {/* Connection Line from Text Area to Rotation Handle */}
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
