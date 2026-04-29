import React, { useCallback, useRef, useState } from 'react';

export const SportsPhotoElements = ({
  photos,
  activeElement,
  handleDrag,
  startDragging,
  stopDragging,
  handleElementClick,
  updatePhotoProperties,
}) => {
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const pinchData = useRef(null);

  const renderPhotos = useCallback(() => {
    return photos.map((photo) => {
      const isActive = activeElement.type === 'photo' && activeElement.id === photo.id;
      const aspectRatio = photo.aspectRatio || photo.width / photo.height;
      const containerStyle = {
        position: 'absolute',
        left: `${photo.x}px`,
        top: `${photo.y}px`,
        cursor: isActive ? 'move' : 'default',
        userSelect: 'none',
        transform: `translate(-50%, -50%) rotate(${photo.rotation || 0}deg)`,
        willChange: 'transform, width, height',
        transition: isResizing || isRotating ? 'none' : 'transform 0.1s',
        width: `${photo.width}px`,
        height: `${photo.height}px`,
        overflow: 'visible',
        margin: 0,
        padding: 0,
      };

      const imageStyle = {
        width: '100%',
        height: '100%',
        objectFit: 'fill',
        opacity: photo.opacity || 1,
        filter: photo.filter || `brightness(${photo.brightness * 100 || 100}%)`,
      };

      const handleStyle = {
        position: 'absolute',
        width: '10px',
        height: '10px',
        background: '#fff',
        border: '1px solid #000',
        borderRadius: '50%',
        cursor: 'nwse-resize',
      };

      const middleHandleStyle = {
        position: 'absolute',
        width: '10px',
        height: '10px',
        background: '#fff',
        border: '1px solid #000',
        borderRadius: '50%',
      };

      const rotateHandleStyle = {
        position: 'absolute',
        width: '10px',
        height: '10px',
        background: '#0f0',
        border: '1px solid #000',
        borderRadius: '50%',
        cursor: 'grab',
        top: '-20px',
        left: '50%',
        transform: 'translateX(-50%)',
      };

      const handleContextMenu = (e) => {
        e.preventDefault();
        if (isActive) {
          const action = prompt(
            'Choose an action: \n1. Adjust Brightness (+10%)\n2. Adjust Brightness (-10%)\n3. Recolor (Grayscale)\n4. Reset',
            '1'
          );
          if (action === '1') {
            updatePhotoProperties(photo.id, { brightness: (photo.brightness || 1) + 0.1 });
          } else if (action === '2') {
            updatePhotoProperties(photo.id, { brightness: (photo.brightness || 1) - 0.1 });
          } else if (action === '3') {
            updatePhotoProperties(photo.id, { filter: 'grayscale(100%)' });
          } else if (action === '4') {
            updatePhotoProperties(photo.id, { brightness: 1, filter: 'none', rotation: 0 });
          }
        }
      };

      const startResizing = (e, handleType) => {
        e.stopPropagation();
        setIsResizing(true);
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = photo.width;
        const startHeight = photo.height;
        const startYPos = photo.y;

        const onResizeMove = (moveEvent) => {
          const deltaX = moveEvent.clientX - startX;
          const deltaY = moveEvent.clientY - startY;
          let newWidth = startWidth;
          let newHeight = startHeight;
          let newY = startYPos;

          if (['top-left', 'top-right', 'bottom-left', 'bottom-right'].includes(handleType)) {
            if (handleType === 'bottom-right') {
              newWidth = startWidth + deltaX;
              newHeight = newWidth / aspectRatio;
            } else if (handleType === 'bottom-left') {
              newWidth = startWidth - deltaX;
              newHeight = newWidth / aspectRatio;
            } else if (handleType === 'top-right') {
              newWidth = startWidth + deltaX;
              newHeight = newWidth / aspectRatio;
            } else if (handleType === 'top-left') {
              newWidth = startWidth - deltaX;
              newHeight = newWidth / aspectRatio;
            }
          } else if (handleType === 'left') {
            newWidth = startWidth - deltaX;
          } else if (handleType === 'right') {
            newWidth = startWidth + deltaX;
          } else if (handleType === 'top') {
            newHeight = Math.max(50, startHeight - deltaY);
            newY = startYPos + (startHeight - newHeight) / 2;
          } else if (handleType === 'bottom') {
            newHeight = Math.max(50, startHeight + deltaY);
            newY = startYPos - (newHeight - startHeight) / 2;
          }

          if (newWidth > 50 && newHeight > 50) {
            updatePhotoProperties(photo.id, { width: newWidth, height: newHeight, y: newY });
          }
        };

        const onResizeEnd = () => {
          setIsResizing(false);
          window.removeEventListener('pointermove', onResizeMove);
          window.removeEventListener('pointerup', onResizeEnd);
        };

        window.addEventListener('pointermove', onResizeMove);
        window.addEventListener('pointerup', onResizeEnd);
      };

      const startRotating = (e) => {
        e.stopPropagation();
        setIsRotating(true);
        const rect = e.currentTarget.parentElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);

        const onRotateMove = (moveEvent) => {
          const newAngle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) * (180 / Math.PI);
          const rotationDelta = newAngle - startAngle;
          updatePhotoProperties(photo.id, { rotation: (photo.rotation || 0) + rotationDelta });
        };

        const onRotateEnd = () => {
          setIsRotating(false);
          window.removeEventListener('pointermove', onRotateMove);
          window.removeEventListener('pointerup', onRotateEnd);
        };

        window.addEventListener('pointermove', onRotateMove);
        window.addEventListener('pointerup', onRotateEnd);
      };

      const handlePinch = (e) => {
        e.preventDefault();
        if (e.type === 'touchstart' && e.touches.length === 2) {
          const touch1 = e.touches[0];
          const touch2 = e.touches[1];
          const startDistance = Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
          pinchData.current = { startDistance, startWidth: photo.width, startHeight: photo.height };

          const onPinchMove = (moveEvent) => {
            if (moveEvent.touches.length === 2) {
              const newTouch1 = moveEvent.touches[0];
              const newTouch2 = moveEvent.touches[1];
              const newDistance = Math.hypot(newTouch1.clientX - newTouch2.clientX, newTouch1.clientY - newTouch2.clientY);
              const scale = newDistance / pinchData.current.startDistance;
              const newWidth = pinchData.current.startWidth * scale;
              const newHeight = pinchData.current.startHeight * scale;

              if (newWidth > 50 && newHeight > 50) {
                updatePhotoProperties(photo.id, { width: newWidth, height: newHeight });
              }
            }
          };

          const onPinchEnd = () => {
            pinchData.current = null;
            window.removeEventListener('touchmove', onPinchMove);
            window.removeEventListener('touchend', onPinchEnd);
          };

          window.addEventListener('touchmove', onPinchMove);
          window.addEventListener('touchend', onPinchEnd);
        }
      };

      return (
        <div
          key={photo.id}
          className={`photo-element-pks ${isActive ? 'active-pks' : ''}`}
          style={containerStyle}
          onPointerDown={(e) => {
            handleElementClick('photo', photo.id, e);
            startDragging('photo', photo.id, e);
          }}
          onPointerMove={handleDrag}
          onPointerUp={stopDragging}
          onContextMenu={handleContextMenu}
          onTouchStart={handlePinch}
        >
          <img src={photo.src} alt="Overlay photo" style={imageStyle} />
          {isActive && (
            <>
              <div
                style={{ ...handleStyle, top: '-5px', left: '-5px' }}
                onPointerDown={(e) => startResizing(e, 'top-left')}
              />
              <div
                style={{ ...handleStyle, top: '-5px', right: '-5px' }}
                onPointerDown={(e) => startResizing(e, 'top-right')}
              />
              <div
                style={{ ...handleStyle, bottom: '-5px', left: '-5px' }}
                onPointerDown={(e) => startResizing(e, 'bottom-left')}
              />
              <div
                style={{ ...handleStyle, bottom: '-5px', right: '-5px' }}
                onPointerDown={(e) => startResizing(e, 'bottom-right')}
              />
              <div
                style={{ ...middleHandleStyle, top: '50%', left: '-5px', transform: 'translateY(-50%)', cursor: 'ew-resize' }}
                onPointerDown={(e) => startResizing(e, 'left')}
              />
              <div
                style={{ ...middleHandleStyle, top: '50%', right: '-5px', transform: 'translateY(-50%)', cursor: 'ew-resize' }}
                onPointerDown={(e) => startResizing(e, 'right')}
              />
              <div
                style={{ ...middleHandleStyle, top: '-5px', left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' }}
                onPointerDown={(e) => startResizing(e, 'top')}
              />
              <div
                style={{ ...middleHandleStyle, bottom: '-5px', left: '50%', transform: 'translateX(-50%)', cursor: 'ns-resize' }}
                onPointerDown={(e) => startResizing(e, 'bottom')}
              />
              <div style={rotateHandleStyle} onPointerDown={startRotating} />
            </>
          )}
        </div>
      );
    });
  }, [
    photos,
    activeElement,
    handleDrag,
    startDragging,
    stopDragging,
    handleElementClick,
    updatePhotoProperties,
    isResizing,
    isRotating,
  ]);

  return <>{renderPhotos()}</>;
};