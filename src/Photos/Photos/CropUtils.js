/**
 * Crop an image based on the crop area coordinates
 * @param {string} imageSrc - The image source (data URL or URL)
 * @param {object} cropArea - The crop area {x, y, width, height}
 * @param {object} imageDimensions - The original image dimensions {width, height}
 * @returns {Promise<string>} - The cropped image as data URL
 */
export const cropImage = (imageSrc, cropArea, imageDimensions) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Calculate the scale ratio between display dimensions and actual image dimensions
      const scaleX = img.naturalWidth / imageDimensions.width;
      const scaleY = img.naturalHeight / imageDimensions.height;

      // Set canvas size to the crop area
      canvas.width = cropArea.width * scaleX;
      canvas.height = cropArea.height * scaleY;

      // Draw the cropped image
      ctx.drawImage(
        img,
        cropArea.x * scaleX,
        cropArea.y * scaleY,
        cropArea.width * scaleX,
        cropArea.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageSrc;
  });
};

/**
 * Get image dimensions from a data URL or image URL
 * @param {string} imageSrc - The image source
 * @returns {Promise<object>} - The dimensions {width, height, naturalWidth, naturalHeight}
 */
export const getImageDimensions = (imageSrc) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        aspectRatio: img.naturalWidth / img.naturalHeight,
      });
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageSrc;
  });
};

/**
 * Calculate crop area to maintain aspect ratio
 * @param {number} width - The desired width
 * @param {number} height - The desired height
 * @param {number} aspectRatio - The aspect ratio (width/height)
 * @returns {object} - The constrained dimensions
 */
export const constrainToAspectRatio = (width, height, aspectRatio) => {
  if (width / height > aspectRatio) {
    return {
      width: Math.round(height * aspectRatio),
      height,
    };
  }
  return {
    width,
    height: Math.round(width / aspectRatio),
  };
};

/**
 * Center crop area on image
 * @param {object} cropArea - The crop area
 * @param {object} imageDimensions - The image dimensions
 * @returns {object} - The centered crop area
 */
export const centerCropArea = (cropArea, imageDimensions) => {
  return {
    x: Math.max(0, (imageDimensions.width - cropArea.width) / 2),
    y: Math.max(0, (imageDimensions.height - cropArea.height) / 2),
    width: cropArea.width,
    height: cropArea.height,
  };
};

/**
 * Flip crop area horizontally
 * @param {object} cropArea - The crop area
 * @param {object} imageDimensions - The image dimensions
 * @returns {object} - The flipped crop area
 */
export const flipCropAreaHorizontally = (cropArea, imageDimensions) => {
  return {
    x: imageDimensions.width - cropArea.x - cropArea.width,
    y: cropArea.y,
    width: cropArea.width,
    height: cropArea.height,
  };
};

/**
 * Flip crop area vertically
 * @param {object} cropArea - The crop area
 * @param {object} imageDimensions - The image dimensions
 * @returns {object} - The flipped crop area
 */
export const flipCropAreaVertically = (cropArea, imageDimensions) => {
  return {
    x: cropArea.x,
    y: imageDimensions.height - cropArea.y - cropArea.height,
    width: cropArea.width,
    height: cropArea.height,
  };
};

/**
 * Save crop area to localStorage for persistence
 * @param {string} key - The storage key
 * @param {object} cropArea - The crop area to save
 */
export const saveCropAreaToStorage = (key, cropArea) => {
  try {
    localStorage.setItem(key, JSON.stringify(cropArea));
  } catch (e) {
    console.error('Failed to save crop area:', e);
  }
};

/**
 * Load crop area from localStorage
 * @param {string} key - The storage key
 * @returns {object|null} - The saved crop area or null
 */
export const loadCropAreaFromStorage = (key) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error('Failed to load crop area:', e);
    return null;
  }
};
