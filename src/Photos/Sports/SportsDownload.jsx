import React, { useCallback, useEffect, useRef, useState } from 'react';
import { loadImage, measureTextWidth } from './SportsUtils';
import './Sports.css';

export const SportsDownload = ({
  image,
  additionalImages,
  texts,
  logos,
  team1Logo,
  team2Logo,
  team1Score,
  team2Score,
  filters,
  canvasRefs,
  imageDimensions,
  selectedCompetition,
  matchStatus,
  team1Goals,
  team2Goals,
  isMatchday,
  showScoreBox,
  selectedFeature,
  customMatchTime,
  spokesperson,
  matchDateTime,
  fontFamily,
  onSubscriptionModalOpen,
}) => {
  const imageCache = useRef(new Map());
  const isDownloading = useRef(false);

  useEffect(() => {
    const preloadImages = async () => {
      try {
        if (image) {
          const bgImg = await loadImage(image);
          imageCache.current.set(image, bgImg);
        }
        if ((isMatchday || selectedFeature === 'quote' || selectedFeature === 'merge') && additionalImages.length > 0) {
          const additionalImagePromises = additionalImages.map(async (imgSrc) => {
            const img = await loadImage(imgSrc);
            imageCache.current.set(imgSrc, img);
          });
          await Promise.all(additionalImagePromises);
        }
        const logoPromises = logos
          .filter((logo) => logo.src && logo.type === 'logo')
          .map(async (logo) => {
            const img = await loadImage(logo.src);
            imageCache.current.set(logo.src, img);
          });
        if (team1Logo?.src) {
          const img = await loadImage(team1Logo.src);
          imageCache.current.set(team1Logo.src, img);
        }
        if (team2Logo?.src) {
          const img = await loadImage(team2Logo.src);
          imageCache.current.set(team2Logo.src, img);
        }
        await Promise.all(logoPromises);
      } catch (err) {
        console.error('Failed to preload images:', err);
      }
    };
    preloadImages();
  }, [image, additionalImages, logos, team1Logo, team2Logo, isMatchday, selectedFeature]);

  const drawUnderline = (ctx, text, scaledFontSize, textWidth, lineY, lineHeight) => {
    ctx.beginPath();
    const underlineY = lineY + scaledFontSize * 0.1;
    ctx.moveTo(-textWidth / 2, underlineY);
    ctx.lineTo(textWidth / 2, underlineY);
    ctx.strokeStyle = text.stroke || '#000000';
    ctx.lineWidth = scaledFontSize / 20;
    ctx.stroke();
  };

  const drawGradientText = (ctx, text, lines, scaledFontSize, fontStyle, textWidth, lineHeight, startY) => {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = textWidth;
    tempCanvas.height = lineHeight * lines.length;

    tempCtx.font = `${fontStyle}${scaledFontSize}px ${text.fontFamily || 'Roboto'}`;
    tempCtx.textAlign = 'center';
    tempCtx.textBaseline = 'middle';

    lines.forEach((line, index) => {
      tempCtx.fillText(line, textWidth / 2, startY + index * lineHeight - startY + lineHeight / 2);
    });
    tempCtx.globalCompositeOperation = 'source-in';

    const gradient = ctx.createLinearGradient(0, 0, textWidth, lineHeight * lines.length);
    gradient.addColorStop(0, text.color.split(',')[0] || '#ffffff');
    gradient.addColorStop(1, text.color.split(',')[1] || '#ffffff');
    tempCtx.fillStyle = gradient;
    tempCtx.fillRect(0, 0, textWidth, lineHeight * lines.length);

    ctx.drawImage(tempCanvas, -textWidth / 2, startY - lineHeight / 2);
    tempCanvas.remove();
  };

  const drawLogo = (ctx, logo, scaleX, scaleY, x, y, logoSize) => {
    const img = imageCache.current.get(logo.src);
    if (!img) return Promise.resolve();

    const originalWidth = img.naturalWidth;
    const originalHeight = img.naturalHeight;
    const targetWidth = logoSize * scaleX;
    const targetHeight = logoSize * scaleY;
    const aspectRatio = originalWidth / originalHeight;

    let displayWidth = targetWidth;
    let displayHeight = targetHeight;
    if (aspectRatio > 1) {
      displayHeight = targetWidth / aspectRatio;
    } else {
      displayWidth = targetHeight * aspectRatio;
    }

    const scaledX = x * scaleX;
    const scaledY = y * scaleY;

    ctx.save();
    ctx.translate(scaledX, scaledY);
    ctx.rotate((logo.rotation || 0) * Math.PI / 180);
    ctx.globalAlpha = logo.opacity || 1;
    ctx.filter = `brightness(${logo.brightness * 100 || 100}%)`;

    if (logo.id === 'quoteImage' && selectedFeature === 'quote') {
      ctx.beginPath();
      ctx.arc(0, 0, Math.min(displayWidth, displayHeight) / 2, 0, Math.PI * 2);
      ctx.clip();
    }

    ctx.drawImage(img, -displayWidth / 2, -displayHeight / 2, displayWidth, displayHeight);
    ctx.restore();
    return Promise.resolve();
  };

  const drawCircularEmoji = (ctx, emoji, x, y, size) => {
    ctx.save();
    ctx.font = `${size}px Arial`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillText(emoji, x, y);
    ctx.restore();
  };

  const drawQuoteBox = (ctx, width, height, scaleX, scaleY) => {
    const boxWidth = 300 * scaleX;
    const textAreaHeight = 100 * Math.min(scaleX, scaleY);
    const bottomInputsHeight = 36 * scaleY;
    const boxHeight = textAreaHeight + bottomInputsHeight + 26 * Math.min(scaleX, scaleY);
    const boxX = width / 2 - boxWidth / 2;
    const boxY = height - boxHeight;
    const padding = 8 * Math.min(scaleX, scaleY);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 10 * Math.min(scaleX, scaleY));
    ctx.fill();

    ctx.font = `bold ${36 * Math.min(scaleX, scaleY)}px 'Roboto', sans-serif`;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('❝', boxX + boxWidth / 2, boxY + 4 * scaleY);

    const quoteImage = logos.find((logo) => logo.id === 'quoteImage');
    const quoteImageSize = 100 * Math.min(scaleX, scaleY);
    const quoteImageCenterX = boxX + boxWidth * 0.75;
    const quoteImageCenterY = boxY - 50 * scaleY;

    if (quoteImage) {
      drawLogo(
        ctx,
        quoteImage,
        scaleX,
        scaleY,
        quoteImageCenterX / scaleX,
        quoteImageCenterY / scaleY,
        100
      );
    } else {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.beginPath();
      ctx.arc(quoteImageCenterX, quoteImageCenterY, quoteImageSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#00ff00';
      ctx.setLineDash([4 * Math.min(scaleX, scaleY), 4 * Math.min(scaleX, scaleY)]);
      ctx.lineWidth = 2 * Math.min(scaleX, scaleY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#fff';
      ctx.font = `${14 * Math.min(scaleX, scaleY)}px 'Roboto', sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Image', quoteImageCenterX, quoteImageCenterY);
      ctx.restore();
    }

    const quoteText = customMatchTime || 'Enter quote';
    const fontSize = 18 * Math.min(scaleX, scaleY);
    const textAreaTop = boxY + 40 * Math.min(scaleX, scaleY);
    const textAreaWidth = boxWidth - 16 * scaleX;
    const maxWidth = textAreaWidth;
    const lineHeight = 22 * Math.min(scaleX, scaleY);
    const availableHeight = textAreaHeight - 8 * Math.min(scaleX, scaleY);
    const maxLines = Math.floor(availableHeight / lineHeight);

    const wrapText = (text) => {
      ctx.font = `700 ${fontSize}px 'Roboto', sans-serif`;
      const paragraphs = text.split('\n');
      const lines = [];

      const addLine = (nextLine) => {
        lines.push(nextLine.trim());
      };

      const splitLongWord = (word) => {
        let remainder = word;
        while (remainder.length > 0) {
          let chunk = remainder;
          while (ctx.measureText(chunk).width > maxWidth && chunk.length > 1) {
            chunk = chunk.slice(0, -1);
          }
          if (!chunk) break;
          if (chunk.length < remainder.length) {
            addLine(`${chunk}-`);
            remainder = remainder.slice(chunk.length);
          } else {
            addLine(chunk);
            remainder = '';
          }
        }
      };

      paragraphs.forEach((paragraph, paragraphIndex) => {
        let line = '';
        const words = paragraph.split(' ');
        words.forEach((word) => {
          const testLine = line ? `${line} ${word}` : word;
          const testWidth = ctx.measureText(testLine).width;
          if (testWidth <= maxWidth) {
            line = testLine;
          } else {
            if (line) {
              addLine(line);
              line = word;
            } else {
              splitLongWord(word);
              line = '';
            }
          }
        });
        if (line) {
          addLine(line);
        }
        if (paragraphIndex < paragraphs.length - 1) {
          lines.push('');
        }
      });
      return lines;
    };

    let lines = wrapText(quoteText);
    if (lines.length > maxLines) {
      lines = lines.slice(0, maxLines);
    }

    const textBlockHeight = lines.length * lineHeight;
    const startY = textAreaTop + (availableHeight - textBlockHeight) / 2;

    const textAreaX = boxX + 8 * scaleX;
    ctx.save();
    ctx.beginPath();
    ctx.rect(textAreaX, textAreaTop, textAreaWidth, textAreaHeight);
    ctx.clip();

    ctx.font = `700 ${fontSize}px 'Roboto', sans-serif`;
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowOffsetX = 1 * Math.min(scaleX, scaleY);
    ctx.shadowOffsetY = 1 * Math.min(scaleX, scaleY);
    ctx.shadowBlur = 2 * Math.min(scaleX, scaleY);
    lines.forEach((line, index) => {
      ctx.fillText(line || ' ', boxX + boxWidth / 2, startY + index * lineHeight);
    });
    ctx.restore();
    ctx.shadowColor = 'transparent';

    const spokespersonText = spokesperson || 'Spokesperson';
    ctx.font = `bold ${14 * Math.min(scaleX, scaleY)}px 'Roboto', sans-serif`;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(spokespersonText, boxX + boxWidth - padding, boxY + boxHeight - 36 * scaleY);

    const dateText = `${matchDateTime.day} ${matchDateTime.month} ${matchDateTime.year}`;
    ctx.font = `${12 * Math.min(scaleX, scaleY)}px 'Roboto', sans-serif`;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'right';
    ctx.fillText(dateText, boxX + boxWidth - padding, boxY + boxHeight - 16 * scaleY);
  };

  const drawScoreBox = (ctx, targetWidth, targetHeight, scaleX, scaleY) => {
    const scoreBoxWidth = targetWidth * 0.8;
    const scoreBoxPadding = 8 * Math.min(scaleX, scaleY);
    const numGoals = isMatchday ? 0 : Math.max(team1Goals.length, team2Goals.length);
    const scoreBoxHeight = isMatchday
      ? (36 + 80 + 36 + 20) * Math.min(scaleX, scaleY)
      : (36 + 60 + 36 + numGoals * 20 + 20) * Math.min(scaleX, scaleY);
    const scoreBoxY = targetHeight - scoreBoxHeight;
    const scoreBoxLeft = (targetWidth - scoreBoxWidth) / 2;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.roundRect(
      scoreBoxLeft,
      scoreBoxY,
      scoreBoxWidth,
      scoreBoxHeight,
      10 * Math.min(scaleX, scaleY)
    );
    ctx.fill();
    ctx.restore();

    const competitionHeight = 36 * Math.min(scaleX, scaleY);
    const competitionY = scoreBoxY + scoreBoxPadding;
    const competitionFontSize = 11 * Math.min(scaleX, scaleY);
    ctx.save();
    ctx.font = `bold ${competitionFontSize}px Arial`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const competitionText = selectedCompetition || 'Premier League';
    ctx.fillText(competitionText, targetWidth / 2, competitionY + competitionHeight / 2, scoreBoxWidth * 0.5);
    ctx.restore();

    const teamLogoPromises = [];
    if (team1Logo) {
      const team1X = scoreBoxLeft + scoreBoxPadding + (isMatchday ? 80 : 60) * scaleX / 2;
      const team1Y = competitionY + competitionHeight + (isMatchday ? 80 : 60) / 2 * scaleY;
      teamLogoPromises.push(
        drawLogo(
          ctx,
          { ...team1Logo, width: isMatchday ? 80 : 60, height: isMatchday ? 80 : 60 },
          scaleX,
          scaleY,
          team1X / scaleX,
          team1Y / scaleY,
          isMatchday ? 80 : 60
        )
      );
    }
    if (team2Logo) {
      const team2X = scoreBoxLeft + scoreBoxWidth - scoreBoxPadding - (isMatchday ? 80 : 60) * scaleX / 2;
      const team2Y = competitionY + competitionHeight + (isMatchday ? 80 : 60) / 2 * scaleY;
      teamLogoPromises.push(
        drawLogo(
          ctx,
          { ...team2Logo, width: isMatchday ? 80 : 60, height: isMatchday ? 80 : 60 },
          scaleX,
          scaleY,
          team2X / scaleX,
          team2Y / scaleY,
          isMatchday ? 80 : 60
        )
      );
    }

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (isMatchday) {
      const vsFontSize = 36 * Math.min(scaleX, scaleY);
      ctx.font = `900 ${vsFontSize}px Arial`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText('VS', scoreBoxLeft + scoreBoxWidth / 2, competitionY + competitionHeight + (isMatchday ? 80 : 60) / 2 * scaleY);
    } else {
      const scoreFontSize = 48 * Math.min(scaleX, scaleY);
      ctx.font = `900 ${scoreFontSize}px Arial`;
      ctx.fillStyle = '#ffffff';
      const scoreX1 = scoreBoxLeft + scoreBoxPadding + 80 * scaleX;
      const scoreX2 = scoreBoxLeft + scoreBoxWidth - scoreBoxPadding - 80 * scaleX;
      const scoreY = competitionY + competitionHeight + (isMatchday ? 80 : 60) / 2 * scaleY;
      ctx.fillText(team1Score || '0', scoreX1, scoreY);
      ctx.fillText('-', scoreBoxLeft + scoreBoxWidth / 2, scoreY);
      ctx.fillText(team2Score || '0', scoreX2, scoreY);
    }
    ctx.restore();

    const matchStatusHeight = 36 * Math.min(scaleX, scaleY);
    const matchStatusY = competitionY + (isMatchday ? 80 : 60) * scaleY + 20 * Math.min(scaleX, scaleY);
    if (isMatchday) {
      let formattedMatchStatus = matchStatus || `${matchDateTime.weekday} ${matchDateTime.day}/${matchDateTime.month}/${matchDateTime.year} ${matchDateTime.hour}:${matchDateTime.minute}`;
      if (formattedMatchStatus.includes('/')) {
        const [weekday, datePart, time] = formattedMatchStatus.split(' ');
        const [day, month, year] = datePart.split('/');
        formattedMatchStatus = `${weekday} ${day} ${month} ${time}`;
      }
      const dateParts = formattedMatchStatus.split(' ');
      ctx.save();
      ctx.font = `bold ${12 * Math.min(scaleX, scaleY)}px Arial`;
      ctx.fillStyle = '#00ff00';
      ctx.textAlign = 'left';
      const spacing = 8 * Math.min(scaleX, scaleY);
      let totalWidth = dateParts.reduce((sum, part) => {
        const partWidth = ctx.measureText(part).width;
        return sum + partWidth + spacing;
      }, 0) - spacing;
      let currentX = scoreBoxLeft + (scoreBoxWidth - totalWidth) / 2;
      dateParts.forEach((part) => {
        ctx.fillText(part, currentX, matchStatusY + matchStatusHeight / 2);
        currentX += ctx.measureText(part).width + spacing;
      });
      ctx.restore();
    } else {
      const matchStatusFontSize = 11 * Math.min(scaleX, scaleY);
      ctx.save();
      ctx.font = `bold ${matchStatusFontSize}px Arial`;
      ctx.fillStyle = '#00ff00';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const statusText = matchStatus || 'Full-Time';
      ctx.fillText(statusText, targetWidth / 2, matchStatusY + matchStatusHeight / 2);
      ctx.restore();
    }

    if (!isMatchday) {
      const goalsY = matchStatusY + matchStatusHeight;
      const teamGoalsWidth = scoreBoxWidth * 0.48;
      const team2Offset = scoreBoxWidth * 0.52;
      const goalEntryHeight = 20 * Math.min(scaleX, scaleY);
      const goalFontSize = 10 * Math.min(scaleX, scaleY);
      const ballSize = 7 * Math.min(scaleX, scaleY);
      const playerWidth = 80 * scaleX;
      const timeWidth = 60 * scaleX;
      const gap = 4 * scaleX;
      const entryWidth = playerWidth + gap + timeWidth + gap + ballSize;

      team1Goals.forEach((goal, index) => {
        const goalY = goalsY + index * goalEntryHeight;
        ctx.save();
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        const scoreBoxLeft = (targetWidth - scoreBoxWidth) / 2;
        const padding = 10 * Math.min(scaleX, scaleY);
        let xOffset = scoreBoxLeft + padding;

        ctx.font = `550 ${goalFontSize}px Arial`;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(goal.player || 'Player', xOffset, goalY + goalEntryHeight / 2, playerWidth);

        xOffset += playerWidth + gap;

  ctx.font = `300 ${goalFontSize}px Arial`;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(goal.time ? `${goal.time}'` : 'Time', xOffset, goalY + goalEntryHeight / 2, timeWidth);

        xOffset += timeWidth + gap;

        drawCircularEmoji(ctx, '⚽', xOffset + ballSize / 2, goalY + goalEntryHeight / 2, ballSize);

        ctx.restore();
      });


      team2Goals.forEach((goal, index) => {
        const goalY = goalsY + index * goalEntryHeight;
        ctx.save();
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'left';
        const scoreBoxLeft = (targetWidth - scoreBoxWidth) / 2;
        let xOffset = scoreBoxLeft + team2Offset + (teamGoalsWidth - entryWidth) / 2;

        drawCircularEmoji(ctx, '⚽', xOffset + ballSize / 2, goalY + goalEntryHeight / 2, ballSize);

        xOffset += ballSize + gap;

        ctx.font = `300 ${goalFontSize}px Arial`;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(goal.time ? `${goal.time}'` : 'Time', xOffset, goalY + goalEntryHeight / 2, timeWidth);

        xOffset += timeWidth + gap;

        ctx.font = `550 ${goalFontSize}px Arial`;
        ctx.fillStyle = '#ffffff';
        ctx.fillText(goal.player || 'Player', xOffset, goalY + goalEntryHeight / 2, playerWidth);

        ctx.restore();
      });
    }

    return teamLogoPromises;
  };

  const downloadSportsImage = useCallback(() => {
    if (isDownloading.current) return;
    isDownloading.current = true;

    const { canvasRef, imageRef, additionalImageRefs } = canvasRefs;
    if (!canvasRef?.current || !image) {
      alert('No image available for download. Please select an image.');
      isDownloading.current = false;
      return;
    }

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    const img = imageCache.current.get(image) || imageRef.current;
    const originalWidth = img.naturalWidth;
    const originalHeight = img.naturalHeight;

    const targetWidth = (isMatchday || selectedFeature === 'quote' || selectedFeature === 'merge') && additionalImages.length > 0 ? 1080 : originalWidth;
    const targetHeight = (isMatchday || selectedFeature === 'quote' || selectedFeature === 'merge') && additionalImages.length > 0 ? (selectedFeature === 'merge' ? 1080 : 1350) : originalHeight;

    tempCanvas.width = targetWidth;
    tempCanvas.height = targetHeight;

    const canvasWidth = imageDimensions.width;
    const canvasHeight = imageDimensions.height;
    const scaleX = (isMatchday || selectedFeature === 'quote' || selectedFeature === 'merge') && additionalImages.length > 0 ? targetWidth / (canvasWidth * 2) : targetWidth / canvasWidth;
    const scaleY = targetHeight / canvasHeight;

    if (selectedFeature !== 'merge') {
      tempCtx.filter = `
        brightness(${filters.brightness}%)
        contrast(${filters.contrast}%)
        saturate(${filters.saturation}%)
        grayscale(${filters.grayscale}%)
        sepia(${filters.sepia}%)
        blur(${filters.blur}px)
      `;
      tempCtx.drawImage(
        img,
        0,
        0,
        (isMatchday || selectedFeature === 'quote') && additionalImages.length > 0 ? targetWidth / 2 : targetWidth,
        (isMatchday || selectedFeature === 'quote') && additionalImages.length >= 2 ? targetHeight / 2 : targetHeight
      );
      tempCtx.filter = 'none';
    }

    if ((isMatchday || selectedFeature === 'quote') && additionalImages.length > 0) {
      additionalImages.forEach((imgSrc, index) => {
        const additionalImg = imageCache.current.get(imgSrc) || additionalImageRefs.current[index];
        if (additionalImg) {
          const widthPerImage = targetWidth / 2;
          const heightPerImage = additionalImages.length >= 2 ? targetHeight / 2 : targetHeight;
          let x, y;
          if (index === 0) {
            x = widthPerImage;
            y = 0;
          } else if (index === 1) {
            x = 0;
            y = heightPerImage;
          } else if (index === 2) {
            x = widthPerImage;
            y = heightPerImage;
          }
          tempCtx.filter = `
            brightness(${filters.brightness}%)
            contrast(${filters.contrast}%)
            saturate(${filters.saturation}%)
            grayscale(${filters.grayscale}%)
            sepia(${filters.sepia}%)
            blur(${filters.blur}px)
          `;
          tempCtx.drawImage(additionalImg, x, y, widthPerImage, heightPerImage);
          tempCtx.filter = 'none';
        }
      });
    }

    if (selectedFeature === 'merge' && additionalImages.length > 0) {
      const numImages = additionalImages.length;
      let cols, rows;
      if (numImages === 1) { cols = 1; rows = 1; }
      else if (numImages === 2) { cols = 2; rows = 1; }
      else if (numImages === 3) { cols = 3; rows = 1; }
      else if (numImages === 4) { cols = 2; rows = 2; }
      else { cols = Math.ceil(Math.sqrt(numImages)); rows = Math.ceil(numImages / cols); }
      const cellWidth = targetWidth / cols;
      const cellHeight = targetHeight / rows;
      additionalImages.forEach((imgSrc, index) => {
        const additionalImg = imageCache.current.get(imgSrc) || additionalImageRefs.current[index];
        if (additionalImg) {
          const col = index % cols;
          const row = Math.floor(index / cols);
          const x = col * cellWidth;
          const y = row * cellHeight;
          const imgAspect = additionalImg.naturalWidth / additionalImg.naturalHeight;
          const cellAspect = cellWidth / cellHeight;
          let drawWidth, drawHeight, drawX, drawY;
          if (imgAspect > cellAspect) {
            // image wider, fit to width
            drawWidth = cellWidth;
            drawHeight = cellWidth / imgAspect;
            drawX = x;
            drawY = y + (cellHeight - drawHeight) / 2;
          } else {
            // image taller, fit to height
            drawHeight = cellHeight;
            drawWidth = cellHeight * imgAspect;
            drawX = x + (cellWidth - drawWidth) / 2;
            drawY = y;
          }
          tempCtx.filter = `
            brightness(${filters.brightness}%)
            contrast(${filters.contrast}%)
            saturate(${filters.saturation}%)
            grayscale(${filters.grayscale}%)
            sepia(${filters.sepia}%)
            blur(${filters.blur}px)
          `;
          tempCtx.drawImage(additionalImg, drawX, drawY, drawWidth, drawHeight);
          tempCtx.filter = 'none';
        }
      });
    }

    const logoPromises = logos
      .filter(
        (logo) =>
          logo.type === 'logo' &&
          logo.id !== 'team1Logo' &&
          logo.id !== 'team2Logo' &&
          logo.id !== 'quoteImage'
      )
      .map((logo) =>
        drawLogo(tempCtx, logo, scaleX, scaleY, logo.x, logo.y, logo.width)
      );

    texts.forEach((text) => {
      tempCtx.save();
      const scaledX = text.x * scaleX;
      const scaledY = text.y * scaleY;
      const scaledFontSize = text.fontSize * Math.min(scaleX, scaleY);
      let fontStyle = '';
      if (text.italic) fontStyle += 'italic ';
      if (text.bold) fontStyle += 'bold ';
      const font = `${fontStyle}${scaledFontSize}px ${text.fontFamily || 'Roboto'}`;
      tempCtx.font = font;
      tempCtx.textAlign = 'center';
      tempCtx.textBaseline = 'middle';

      const lines = text.content ? text.content.split('\n') : ['Tap to edit'];
      const lineHeight = scaledFontSize * 1.2;

      let maxTextWidth = 0;
      lines.forEach((line) => {
        const lineWidth = measureTextWidth(line, scaledFontSize, text.fontFamily || 'Roboto', text.bold, text.italic);
        maxTextWidth = Math.max(maxTextWidth, lineWidth);
      });
      const textHeight = lines.length * lineHeight;

      const startY = scaledY - (textHeight / 2) + (lineHeight / 2);

      tempCtx.translate(scaledX, scaledY);
      tempCtx.rotate((text.rotation || 0) * Math.PI / 180);

      if (text.stroke && text.stroke !== 'none') {
        tempCtx.strokeStyle = text.stroke;
        tempCtx.lineWidth = scaledFontSize / 40;
        lines.forEach((line, index) => {
          tempCtx.strokeText(line, 0, startY + index * lineHeight - scaledY);
        });
      }

      if (text.color.includes(',')) {
        drawGradientText(tempCtx, text, lines, scaledFontSize, fontStyle, maxTextWidth, lineHeight, startY - scaledY);
      } else {
        tempCtx.fillStyle = text.color || '#ffffff';
        lines.forEach((line, index) => {
          tempCtx.fillText(line, 0, startY + index * lineHeight - scaledY);
        });
      }

      if (text.underline && text.underline !== 'none') {
        lines.forEach((line, index) => {
          const lineWidth = measureTextWidth(line, scaledFontSize, text.fontFamily || 'Roboto', text.bold, text.italic);
          drawUnderline(tempCtx, text, scaledFontSize, lineWidth, startY + index * lineHeight - scaledY, lineHeight);
        });
      }

      tempCtx.restore();
    });

    if ((selectedFeature === 'quote' || isMatchday || image) && logos.some((logo) => logo.id === 'paltechWhite')) {
      tempCtx.save();
      tempCtx.font = `900 ${20 * Math.min(scaleX, scaleY)}px 'Roboto', sans-serif`;
      tempCtx.fillStyle = 'white';
      tempCtx.textAlign = 'right';
      tempCtx.textBaseline = 'top';
      tempCtx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      tempCtx.shadowOffsetX = 1 * Math.min(scaleX, scaleY);
      tempCtx.shadowOffsetY = 1 * Math.min(scaleX, scaleY);
      tempCtx.shadowBlur = 2 * Math.min(scaleX, scaleY);
      tempCtx.fillText('Campuslife', targetWidth - 10 * scaleX, 10 * scaleY);
      tempCtx.font = `bold ${14 * Math.min(scaleX, scaleY)}px 'Roboto', sans-serif`;
      tempCtx.fillText('.co.ke', targetWidth - 10 * scaleX, 10 * scaleY + 20 * scaleY);
      tempCtx.restore();
    }

    let teamLogoPromises = [];
    if (selectedFeature === 'quote') {
      drawQuoteBox(tempCtx, targetWidth, targetHeight, scaleX, scaleY);
    } else if (showScoreBox) {
      teamLogoPromises = drawScoreBox(tempCtx, targetWidth, targetHeight, scaleX, scaleY);
    }

    return Promise.all([...logoPromises, ...teamLogoPromises]).then(() => {
      const tryGenerateImage = (quality, resolve, reject) => {
        tempCanvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to create image blob'));
              isDownloading.current = false;
              return;
            }

            const sizeKB = (blob.size / 1024).toFixed(2);
            console.log(`Image size at quality ${quality}: ${sizeKB} KB`);

            const targetSizeKB = 500;
            const minQuality = 0.5;
            const qualityStep = 0.05;

            if (sizeKB <= targetSizeKB || quality <= minQuality) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'sports-image.jpg';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              tempCanvas.remove();
              resolve();
            } else {
              setTimeout(() => tryGenerateImage(quality - qualityStep, resolve, reject), 0);
            }
          },
          'image/jpeg',
          quality
        );
      };

      return new Promise((resolve, reject) => {
        tryGenerateImage(0.8, resolve, reject);
      }).finally(() => {
        isDownloading.current = false;
      });
    }).catch((err) => {
      console.error('Failed to process image:', err);
      alert('Failed to process the image. Please try again.');
      isDownloading.current = false;
    });
  }, [
    image,
    additionalImages,
    texts,
    logos,
    team1Logo,
    team2Logo,
    team1Score,
    team2Score,
    filters,
    canvasRefs,
    imageDimensions,
    selectedCompetition,
    matchStatus,
    team1Goals,
    team2Goals,
    isMatchday,
    showScoreBox,
    selectedFeature,
    customMatchTime,
    spokesperson,
    matchDateTime,
    fontFamily,
  ]);

  return (
    <div className="download-section" style={{ padding: '10px', textAlign: 'center' }}>
      <button
        onClick={downloadSportsImage}
        onTouchStart={(e) => {
          downloadSportsImage();
        }}
        style={{
          fontSize: '14px',
          background: 'green',
          color: 'black',
          border: 'none',
          borderRadius: '6px',
          padding: '11px 20px',
          cursor: 'pointer',
          touchAction: 'manipulation',
          width: 'auto',
          maxWidth: '250px',
          display: 'inline-block',
          fontWeight: '600',
          transition: 'background-color 0.2s, transform 0.1s',
          opacity: 1,
        }}
        onMouseDown={(e) => e.preventDefault()}
        onTouchEnd={(e) => e.preventDefault()}
        aria-label="Download sports image"
        role="button"
        disabled={isDownloading.current}
      >
        Download
      </button>
    </div>
  );
};