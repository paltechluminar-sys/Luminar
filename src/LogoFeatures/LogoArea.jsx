import React, { useRef, useEffect, useState } from 'react';
import './LogoArea.css';

export const LogoArea = ({ logo, isSelected, isEditing, onEditStart, onEditEnd }) => {
  const containerRef = useRef(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 100, height: 100 });

  // Load image and get dimensions
  useEffect(() => {
    if (!logo?.src) return;

    const img = new Image();
    img.onload = () => {
      // Calculate dimensions maintaining aspect ratio
      let width = img.naturalWidth;
      let height = img.naturalHeight;

      // Max size constraints - smaller dimensions
      const maxWidth = 60;
      const maxHeight = 60;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
      }

      setImageDimensions({ width, height });
    };
    img.src = logo.src;
  }, [logo?.src]);

  return (
    <div
      ref={containerRef}
      className={`logo-area ${isSelected ? 'selected' : ''}`}
      style={{
        width: `${imageDimensions.width * (logo?.scale || 1) * (logo?.scaleWidth || 1)}px`,
        height: `${imageDimensions.height * (logo?.scale || 1) * (logo?.scaleHeight || 1)}px`,
        position: 'relative',
        userSelect: 'none',
      }}
    >
      <img
        src={logo?.src}
        alt="Logo"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'fill',
          pointerEvents: 'none',
          opacity: logo?.opacity || 1,
        }}
      />
    </div>
  );
};
