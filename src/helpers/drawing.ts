import { createCanvas, loadImage, CanvasRenderingContext2D } from 'canvas';
import {
  arrowUp,
  arrowDown,
  ImgState,
  changeSvgState,
} from '../images/actions/images';
import { formatPrice, addThousandSeperator } from './parser';

export async function drawQuoteImage(
  ticker: string,
  icon: string,
  price: number,
  percentage: number,
  totalValue: number,
  decimals: number,
  colors: { increasing: ImgState; decreasing: ImgState },
  showGradient: boolean = true,
  avgPrice: number = 0,
): Promise<string> {
  const canvasWidth = 144;
  const canvasHeight = 144;
  const tickerLength = 5;
  const priceLength = 6;
  const canvas = createCanvas(canvasWidth, canvasHeight); // Updated size to match the provided image resolution
  const ctx: CanvasRenderingContext2D = canvas.getContext('2d');

  ctx.strokeStyle = '#fff'; // Set the divider line color
  ctx.lineWidth = 3; // Set the divider line width

  let offsetY = -24;

  if (totalValue === 0) {
    // Draw the divider line
    ctx.beginPath();
    ctx.moveTo(10, 61);
    ctx.lineTo(67, 61);
    ctx.stroke();
    offsetY = 0;
  }

  // Determine color and SVG content based on price change
  let svgContent = percentage >= 0 ? arrowUp : arrowDown;
  const state = percentage >= 0 ? colors.increasing : colors.decreasing;
  svgContent = changeSvgState(svgContent, state);

  // Create gradient background from bottom to 70% of canvas height (if enabled)
  if (showGradient) {
    const gradientHeight = canvasHeight;
    const gradient = ctx.createLinearGradient(
      0,
      canvasHeight,
      0,
      canvasHeight - gradientHeight,
    );

    const subtleStateColor = state + '70';
    gradient.addColorStop(0, subtleStateColor);
    gradient.addColorStop(1, 'transparent');

    // Draw the gradient background
    ctx.fillStyle = gradient;
    ctx.fillRect(0, canvasHeight - gradientHeight, canvasWidth, gradientHeight);
  }

  // Encode the SVG content
  const encodedSvgContent = encodeURIComponent(svgContent);

  const arrowImage = await loadImage(
    `data:image/svg+xml;utf8,${encodedSvgContent}`,
    { crossOrigin: 'anonymous' },
  );

  // Draw the stock ticker
  ctx.fillStyle = 'white';
  const tSize = ticker.length > tickerLength ? 18 : 22;
  ctx.font = `bold ${tSize}pt "Verdana"`;

  // Measure the width of the ticker text
  const tickerTextWidth = ctx.measureText(ticker.toUpperCase()).width;

  // Draw the ticker text
  const tickerX = 10; // X position to draw the ticker text
  const tickerY = 43; // Y position to draw the ticker text
  ctx.fillText(ticker.toUpperCase(), tickerX, tickerY);

  if (icon) {
    // Load the icon image
    const iconImage = await loadImage(icon, { crossOrigin: 'anonymous' });
    const iconWidth = 24; // Set the width of the icon (adjust as needed)
    const iconHeight = 24; // Set the height of the icon (adjust as needed)
    const iconX = tickerX + tickerTextWidth + 10; // X position to draw the icon
    const iconY = tickerY - iconHeight; // Y position to draw the icon (adjust as needed)
    ctx.drawImage(iconImage, iconX, iconY, iconWidth, iconHeight);
  }

  // Draw the stock price with thousand separator
  let formattedPrice = formatPrice(price, decimals);

  // Add thousand separator to price if it's >= 1000
  const priceNumber = parseFloat(formattedPrice);
  if (priceNumber >= 1000) {
    // Handle the decimal part separately to maintain proper formatting
    if (formattedPrice.includes('.')) {
      const [wholePart, decimalPart] = formattedPrice.split('.');
      formattedPrice = `${addThousandSeperator(
        parseInt(wholePart),
      )}.${decimalPart}`;
    } else {
      formattedPrice = addThousandSeperator(priceNumber);
    }
  }

  // When P&L is shown, shift elements up slightly to make room for a 5th line
  const hasPnl = totalValue > 0 && avgPrice > 0;
  const pnlShift = hasPnl ? -3 : 0;

  let pSize = formattedPrice.length > priceLength ? 16 : 20;
  pSize = formattedPrice.length > priceLength + 2 ? 14 : pSize;

  ctx.font = `500 ${pSize}pt "Verdana"`;
  const priceText = `${formattedPrice}`;
  const textWidth = ctx.measureText(priceText).width;
  ctx.fillText(priceText, 10, 98 + offsetY + pnlShift);

  // Draw the arrow icon next to the price
  const arrowSize = formattedPrice.length > priceLength ? 15 : 18;
  const aPosition = formattedPrice.length > priceLength ? 82 : 80;
  const arrowX = 10 + textWidth + 5;
  ctx.drawImage(
    arrowImage,
    arrowX,
    aPosition + offsetY + pnlShift,
    arrowSize,
    arrowSize,
  );

  offsetY = totalValue ? offsetY - 3 : offsetY;

  // Set the fill color for percentage change
  ctx.fillStyle = state;
  const dayChangeFontSize = hasPnl ? 14 : 17;
  ctx.font = `bold ${dayChangeFontSize}pt "Verdana"`;
  ctx.fillText(`(${percentage.toFixed(2)}%)`, 10, hasPnl ? 93 : 128 + offsetY);

  if (totalValue) {
    const totalText = addThousandSeperator(Math.round(totalValue));
    const totalFontSize = hasPnl ? 14 : 17;
    ctx.font = `bold ${totalFontSize}pt "Verdana"`;
    ctx.fillStyle = 'white';
    ctx.fillText(totalText, 10, hasPnl ? 118 : 128);

    if (hasPnl) {
      const referencePrice = avgPrice > 0 ? avgPrice : price;
      const pnlPercentage = ((price - referencePrice) / referencePrice) * 100;
      const pnlColor =
        pnlPercentage >= 0 ? colors.increasing : colors.decreasing;
      const pnlSign = pnlPercentage >= 0 ? '+' : '';
      ctx.fillStyle = pnlColor;
      ctx.font = 'bold 12pt "Verdana"';
      ctx.fillText(`(${pnlSign}${pnlPercentage.toFixed(2)}%)`, 10, 137);
    }
  }

  return canvas.toDataURL();
}
