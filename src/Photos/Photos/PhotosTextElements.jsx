import React, { useCallback, useState, useRef, useEffect } from 'react';

export const PhotosTextElements = ({
  texts,
  setTexts,
  activeElement,
  isEditing,
  textStyles,
  textColor = '#ff0000',
  strokeColor,
  fontFamily,
  dragging,
  isRotating,
  isCropping,
  handleDrag,
  handleTouchMove,
  handleTouchEnd,
  handleTextZoom,
  startDragging,
  stopDragging,
  startRotation,
  handleRotation,
  stopRotation,
  handleElementClick,
  handleDoubleClick,
  startLongPress,
  handleMouseWheelRotation,
  handleTextBlur,
  handleTextKeyDown,
  textInputRef,
  updateText,
  handleTouchZoom,
  updateTextProperties,
}) => {
  // Simple editing state - clean and straightforward
  const [editingTextId, setEditingTextId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const textareaRef = useRef(null);

  // Auto-expand textarea - Simple like Quote2Template
  useEffect(() => {
    if (editingTextId && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = `${scrollHeight}px`;
    }
  }, [editingTextId, editValue]);
  
  // Start editing - simple
  const handleStartEditing = useCallback((text) => {
    setEditingTextId(text.id);
    setEditValue(text.content || '');
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
      }
    }, 50);
  }, []);

  // End editing - simple
  const handleEndEditing = useCallback((textId) => {
    if (editValue !== undefined) {
      updateText(textId, { content: editValue });
    }
    setEditingTextId(null);
    setEditValue('');
  }, [editValue, updateText]);

  // Handle key down
  const handleKeyDown = useCallback((e, textId) => {
    if (e.key === 'Escape') {
      handleEndEditing(textId);
    } else if (e.key === 'Enter' && !e.shiftKey) {
      handleEndEditing(textId);
    }
  }, [handleEndEditing]);


  const renderTexts = useCallback(() => {
    return texts.map((text) => {
      const isActive = activeElement.type === 'text' && activeElement.id === text.id;
      const isCurrentlyEditing = editingTextId === text.id;
      const displayContent = isCurrentlyEditing ? editValue : (text.content || '');

      const containerStyle = {
        position: 'absolute',
        left: `${text.x}px`,
        top: `${text.y}px`,
        transform: `translate(0, -50%) rotate(${text.rotation}deg)`,
        transformOrigin: 'center center',
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none',
        pointerEvents: isCropping ? 'none' : 'auto',
        overflow: 'visible',
      };

      const textStyle = {
        fontFamily: text.fontFamily || fontFamily,
        fontSize: `${text.fontSize}px`,
        color: text.color || textColor,
        fontStyle: text.italic ? 'italic' : 'normal',
        fontWeight: text.bold ? 'bold' : 'normal',
        lineHeight: 1.2,
      };

      return (
        <div
          key={text.id}
          className={`text-element ${isActive ? 'active' : ''}`}
          style={containerStyle}
          onPointerDown={(e) => {
            if (!e.target.closest('textarea')) {
              e.preventDefault();
              handleElementClick('text', text.id, e);
              handleStartEditing(text);
            }
          }}
          onTouchStart={(e) => {
            startLongPress('text', text.id, e);
            handleTouchZoom('text', text.id, e);
          }}
          onTouchMove={handleTouchMove}
          onPointerMove={(e) => {
            if (!isCurrentlyEditing) {
              handleDrag(e);
            }
          }}
          onPointerUp={stopDragging}
          onTouchEnd={handleTouchEnd}
          onWheel={(e) => {
            handleTextZoom(text.id, e);
            if (e.ctrlKey) {
              handleMouseWheelRotation(e);
            }
          }}
        >
          {isCurrentlyEditing ? (
            <textarea
              ref={textareaRef}
              value={editValue}
              placeholder="Enter text here..."
              autoFocus
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => handleEndEditing(text.id)}
              onKeyDown={(e) => {
                e.stopPropagation();
                handleKeyDown(e, text.id);
              }}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              style={{
                ...textStyle,
                height: 'auto',
                width: '100%',
                padding: '0px',
                margin: 0,
                border: '1px solid rgba(66, 133, 244, 0.5)',
                borderRadius: '4px',
                background: 'rgba(0, 0, 0, 0.1)',
                resize: 'none',
                overflow: 'hidden',
                outline: 'none',
                caretColor: '#4285f4',
                boxSizing: 'border-box',
                display: 'block',
              }}
              aria-label="Edit text"
            />
          ) : (
            <div
              style={{
                ...textStyle,
                whiteSpace: 'pre-wrap',
                cursor: 'pointer',
                position: 'relative',
                zIndex: 1,
              }}
            >
              {displayContent || '\u00A0'}
            </div>
          )}

          {isActive && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                border: '2px solid #4285f4',
                pointerEvents: 'none',
                borderRadius: '2px',
                background: isCurrentlyEditing ? 'rgba(66, 133, 244, 0.1)' : 'transparent',
                zIndex: 15,
              }}
            />
          )}

          {isActive && (
            <>
              {[
                { pos: 'nw', left: '-4px', top: '-4px', cursor: 'nwse-resize' },
                { pos: 'ne', right: '-4px', top: '-4px', cursor: 'nesw-resize' },
                { pos: 'sw', left: '-4px', bottom: '-4px', cursor: 'nesw-resize' },
                { pos: 'se', right: '-4px', bottom: '-4px', cursor: 'nwse-resize' },
              ].map((handle) => (
                <div
                  key={handle.pos}
                  style={{
                    position: 'absolute',
                    left: handle.left,
                    right: handle.right,
                    top: handle.top,
                    bottom: handle.bottom,
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#4285f4',
                    border: '1px solid #ffffff',
                    borderRadius: '50%',
                    cursor: handle.cursor,
                    zIndex: 20,
                    boxShadow: '0 0 2px rgba(66, 133, 244, 0.5)',
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    const initialFontSize = text.fontSize;
                    const startX = e.clientX;
                    const startY = e.clientY;

                    const handleMouseMove = (moveEvent) => {
                      const deltaX = moveEvent.clientX - startX;
                      const deltaY = moveEvent.clientY - startY;
                      let fontSizeChange = 0;

                      switch (handle.pos) {
                        case 'nw':
                          fontSizeChange = Math.min(deltaX, deltaY);
                          break;
                        case 'ne':
                          fontSizeChange = Math.min(-deltaX, deltaY);
                          break;
                        case 'sw':
                          fontSizeChange = Math.min(deltaX, -deltaY);
                          break;
                        case 'se':
                          fontSizeChange = Math.max(deltaX, deltaY);
                          break;
                        default:
                          break;
                      }

                      const newFontSize = Math.max(10, initialFontSize + fontSizeChange / 5);
                      updateTextProperties(text.id, { fontSize: newFontSize });
                    };

                    const handleMouseUp = () => {
                      document.removeEventListener('pointermove', handleMouseMove);
                      document.removeEventListener('pointerup', handleMouseUp);
                    };

                    document.addEventListener('pointermove', handleMouseMove);
                    document.addEventListener('pointerup', handleMouseUp);
                  }}
                />
              ))}

              <div
                style={{
                  position: 'absolute',
                  top: '-32px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '16px',
                  height: '16px',
                  backgroundColor: '#ffffff',
                  border: '2px solid #4285f4',
                  borderRadius: '50%',
                  cursor: 'grab',
                  zIndex: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  color: '#4285f4',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  startRotation('text', text.id, e);
                }}
                title="Drag to rotate"
              >
                ↻
              </div>
            </>
          )}
        </div>
      );
    });
  }, [
    texts,
    activeElement,
    editingTextId,
    editValue,
    textColor,
    fontFamily,
    dragging,
    isCropping,
    handleDrag,
    handleTouchMove,
    handleTouchEnd,
    handleTextZoom,
    startDragging,
    stopDragging,
    startRotation,
    handleElementClick,
    startLongPress,
    handleMouseWheelRotation,
    updateTextProperties,
    handleStartEditing,
    handleEndEditing,
    handleKeyDown,
  ]);

  return renderTexts();
}; 