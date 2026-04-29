import { throttle } from 'lodash';

// Utility function to measure text width
export const measureTextWidth = (text, fontSize, fontFamily, bold, italic) => {
  const tempCanvas = document.createElement('canvas');
  const ctx = tempCanvas.getContext('2d');
  let fontStyle = '';
  if (italic) fontStyle += 'italic ';
  if (bold) fontStyle += 'bold ';
  ctx.font = `${fontStyle}${fontSize}px ${fontFamily}`;
  const metrics = ctx.measureText(text || ' ');
  return metrics.width;
};

// Utility function to get the image center
export const getImageCenter = (imageRef) => {
  if (imageRef?.current) {
    const { offsetWidth, offsetHeight } = imageRef.current;
    return { x: offsetWidth / 2, y: offsetHeight / 2 };
  }
  return { x: 50, y: 50 };
};

// Utility function to restrict elements within image bounds
export const restrictToBounds = (type, id, x, y, width, height, rotation = 0, imageRef, shapes = []) => {
  if (!imageRef?.current) return { x, y, width, height };
  const imgRect = imageRef.current.getBoundingClientRect();
  const imgWidth = imgRect.width;
  const imgHeight = imgRect.height;

  // Calculate rotated bounding box
  const rad = (rotation * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));
  const boundWidth = width * cos + height * sin;
  const boundHeight = width * sin + height * cos;

  // Restrict center position
  const minX = boundWidth / 2;
  const maxX = imgWidth - boundWidth / 2;
  const minY = boundHeight / 2;
  const maxY = imgHeight - boundHeight / 2;

  const newX = Math.max(minX, Math.min(x, maxX));
  const newY = Math.max(minY, Math.min(y, maxY));

  // Restrict size
  const maxWidth = imgWidth;
  const maxHeight = imgHeight;
  const minSize = type === 'shape' && ['line', 'line-arrow', 'line-double-arrow'].includes(shapes.find(s => s.id === id)?.shapeType) ? 5 : 20;
  const newWidth = Math.max(minSize, Math.min(width, maxWidth));
  const newHeight = type === 'shape' && ['line', 'line-arrow', 'line-double-arrow'].includes(shapes.find(s => s.id === id)?.shapeType)
    ? Math.max(5, Math.min(height, 50))
    : Math.max(minSize, Math.min(height, maxHeight));

  return { x: newX, y: newY, width: newWidth, height: newHeight };
};

// Utility function to apply gradients for shapes and text
export const applyGradient = (ctx, gradientString, x, y, width, height) => {
  let gradient;
  const isRadial = gradientString.startsWith('radial-gradient');
  const colors = gradientString.match(/#[0-9A-Fa-f]{6}|rgb\(\d+,\s*\d+,\s*\d+\)/g) || ['#ff0000', '#000000'];
  const angle = gradientString.match(/(\d+)deg/)?.[1] || '0';

  if (isRadial) {
    gradient = ctx.createRadialGradient(
      x + width / 2,
      y + height / 2,
      0,
      x + width / 2,
      y + height / 2,
      Math.max(width, height) / 2
    );
  } else {
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const x1 = x + (width / 2) * (1 - cos);
    const y1 = y + (height / 2) * (1 - sin);
    const x2 = x + (width / 2) * (1 + cos);
    const y2 = y + (height / 2) * (1 + sin);
    gradient = ctx.createLinearGradient(x1, y1, x2, y2);
  }

  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color);
  });

  return gradient;
};

// Utility function to draw underlines for text
export const drawUnderline = (ctx, text, scaledFontSize, textWidth, scaleX, scaleY) => {
  // Use text.stroke for underline color, fallback to text.color, support gradients
  const underlineColor = text.stroke || text.color || '#ffffff';
  ctx.strokeStyle = underlineColor.includes('gradient')
    ? applyGradient(ctx, underlineColor, -textWidth / 2, 0, textWidth, scaledFontSize)
    : underlineColor;
  ctx.lineCap = 'round';
  const lineWidth = scaledFontSize / 20;
  const thickLineWidth = scaledFontSize / 10;
  const underlineY = scaledFontSize / 2 + lineWidth;
  const startX = -textWidth / 2;
  const endX = textWidth / 2;
  const waveFrequency = textWidth / 10;
  const waveAmplitude = lineWidth * 0.5;

  switch (text.underline) {
    case 'single':
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(startX, underlineY);
      ctx.lineTo(endX, underlineY);
      ctx.stroke();
      break;
    case 'double':
      ctx.lineWidth = lineWidth * 0.5;
      ctx.beginPath();
      ctx.moveTo(startX, underlineY);
      ctx.lineTo(endX, underlineY);
      ctx.moveTo(startX, underlineY + lineWidth * 1.5);
      ctx.lineTo(endX, underlineY + lineWidth * 1.5);
      ctx.stroke();
      break;
    case 'dotted':
      ctx.lineWidth = lineWidth;
      ctx.setLineDash([lineWidth, lineWidth]);
      ctx.beginPath();
      ctx.moveTo(startX, underlineY);
      ctx.lineTo(endX, underlineY);
      ctx.stroke();
      ctx.setLineDash([]);
      break;
    case 'dashed':
      ctx.lineWidth = lineWidth;
      ctx.setLineDash([lineWidth * 3, lineWidth * 2]);
      ctx.beginPath();
      ctx.moveTo(startX, underlineY);
      ctx.lineTo(endX, underlineY);
      ctx.stroke();
      ctx.setLineDash([]);
      break;
    case 'dash-dot':
      ctx.lineWidth = lineWidth;
      ctx.setLineDash([lineWidth * 3, lineWidth, lineWidth, lineWidth]);
      ctx.beginPath();
      ctx.moveTo(startX, underlineY);
      ctx.lineTo(endX, underlineY);
      ctx.stroke();
      ctx.setLineDash([]);
      break;
    case 'dash-dot-dot':
      ctx.lineWidth = lineWidth;
      ctx.setLineDash([lineWidth * 3, lineWidth, lineWidth, lineWidth, lineWidth, lineWidth]);
      ctx.beginPath();
      ctx.moveTo(startX, underlineY);
      ctx.lineTo(endX, underlineY);
      ctx.stroke();
      ctx.setLineDash([]);
      break;
    case 'wave':
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      for (let x = startX; x <= endX; x += waveFrequency) {
        ctx.moveTo(x, underlineY);
        ctx.quadraticCurveTo(
          x + waveFrequency / 4,
          underlineY - waveAmplitude,
          x + waveFrequency / 2,
          underlineY
        );
        ctx.quadraticCurveTo(
          x + (3 * waveFrequency) / 4,
          underlineY + waveAmplitude,
          x + waveFrequency,
          underlineY
        );
      }
      ctx.stroke();
      break;
    case 'double-wave':
      ctx.lineWidth = lineWidth * 0.5;
      ctx.beginPath();
      for (let x = startX; x <= endX; x += waveFrequency) {
        ctx.moveTo(x, underlineY);
        ctx.quadraticCurveTo(
          x + waveFrequency / 4,
          underlineY - waveAmplitude,
          x + waveFrequency / 2,
          underlineY
        );
        ctx.quadraticCurveTo(
          x + (3 * waveFrequency) / 4,
          underlineY + waveAmplitude,
          x + waveFrequency,
          underlineY
        );
      }
      ctx.stroke();
      ctx.beginPath();
      for (let x = startX; x <= endX; x += waveFrequency) {
        ctx.moveTo(x, underlineY + lineWidth * 1.5);
        ctx.quadraticCurveTo(
          x + waveFrequency / 4,
          underlineY + lineWidth * 1.5 - waveAmplitude,
          x + waveFrequency / 2,
          underlineY + lineWidth * 1.5
        );
        ctx.quadraticCurveTo(
          x + (3 * waveFrequency) / 4,
          underlineY + lineWidth * 1.5 + waveAmplitude,
          x + waveFrequency,
          underlineY + lineWidth * 1.5
        );
      }
      ctx.stroke();
      break;
    case 'thick':
      ctx.lineWidth = thickLineWidth;
      ctx.beginPath();
      ctx.moveTo(startX, underlineY);
      ctx.lineTo(endX, underlineY);
      ctx.stroke();
      break;
    case 'heavy-wave':
      ctx.lineWidth = lineWidth * 1.5;
      ctx.beginPath();
      for (let x = startX; x <= endX; x += waveFrequency) {
        ctx.moveTo(x, underlineY);
        ctx.quadraticCurveTo(
          x + waveFrequency / 4,
          underlineY - waveAmplitude * 1.5,
          x + waveFrequency / 2,
          underlineY
        );
        ctx.quadraticCurveTo(
          x + (3 * waveFrequency) / 4,
          underlineY + waveAmplitude * 1.5,
          x + waveFrequency,
          underlineY
        );
      }
      ctx.stroke();
      break;
    case 'long-dash':
      ctx.lineWidth = lineWidth;
      ctx.setLineDash([lineWidth * 6, lineWidth * 2]);
      ctx.beginPath();
      ctx.moveTo(startX, underlineY);
      ctx.lineTo(endX, underlineY);
      ctx.stroke();
      ctx.setLineDash([]);
      break;
    case 'thick-dash':
      ctx.lineWidth = thickLineWidth;
      ctx.setLineDash([lineWidth * 3, lineWidth * 2]);
      ctx.beginPath();
      ctx.moveTo(startX, underlineY);
      ctx.lineTo(endX, underlineY);
      ctx.stroke();
      ctx.setLineDash([]);
      break;
    case 'thick-dotted':
      ctx.lineWidth = thickLineWidth;
      ctx.setLineDash([lineWidth, lineWidth]);
      ctx.beginPath();
      ctx.moveTo(startX, underlineY);
      ctx.lineTo(endX, underlineY);
      ctx.stroke();
      ctx.setLineDash([]);
      break;
    case 'thick-dash-dot':
      ctx.lineWidth = thickLineWidth;
      ctx.setLineDash([lineWidth * 3, lineWidth, lineWidth, lineWidth]);
      ctx.beginPath();
      ctx.moveTo(startX, underlineY);
      ctx.lineTo(endX, underlineY);
      ctx.stroke();
      ctx.setLineDash([]);
      break;
    case 'thick-dash-dot-dot':
      ctx.lineWidth = thickLineWidth;
      ctx.setLineDash([lineWidth * 3, lineWidth, lineWidth, lineWidth, lineWidth, lineWidth]);
      ctx.beginPath();
      ctx.moveTo(startX, underlineY);
      ctx.lineTo(endX, underlineY);
      ctx.stroke();
      ctx.setLineDash([]);
      break;
    default:
      break;
  }
};

// Utility function to load an image
export const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

// Utility function to throttle events
export const throttleEvent = (fn, delay) => throttle(fn, delay);