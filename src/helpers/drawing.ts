import { createCanvas, loadImage, CanvasRenderingContext2D } from 'canvas';
import {
  arrowUp,
  arrowDown,
  ImgState,
  changeSvgState,
} from '../images/actions/images';
import { formatPrice } from './parser';

export async function drawQuoteImage(
  ticker: string,
  icon: string,
  price: number,
  change: number,
  percentage: number
): Promise<string> {
  const canvasWidth = 144;
  const canvasHeight = 144;
  const tickerLength = 5;
  const priceLength = 6;
  const canvas = createCanvas(canvasWidth, canvasHeight); // Updated size to match the provided image resolution
  const ctx: CanvasRenderingContext2D = canvas.getContext('2d');

  ctx.strokeStyle = '#fff'; // Set the divider line color
  ctx.lineWidth = 3; // Set the divider line width

  // Draw the divider line
  ctx.beginPath();
  ctx.moveTo(10, 61);
  ctx.lineTo(67, 61);
  ctx.stroke();

  // Determine color and SVG content based on price change
  let svgContent = change >= 0 ? arrowUp : arrowDown;
  const state = change >= 0 ? ImgState.increasing : ImgState.decreasing;
  svgContent = changeSvgState(svgContent, state);

  // Encode the SVG content
  const encodedSvgContent = encodeURIComponent(svgContent);

  const arrowImage = await loadImage(
    `data:image/svg+xml;utf8,${encodedSvgContent}`
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
    const iconImage = await loadImage(icon);
    const iconWidth = 24; // Set the width of the icon (adjust as needed)
    const iconHeight = 24; // Set the height of the icon (adjust as needed)
    const iconX = tickerX + tickerTextWidth + 10; // X position to draw the icon
    const iconY = tickerY - iconHeight; // Y position to draw the icon (adjust as needed)
    ctx.drawImage(iconImage, iconX, iconY, iconWidth, iconHeight);
  }

  // Draw the stock price
  const formattedPrice = formatPrice(price);
  const pSize = formattedPrice.length > priceLength ? 16 : 20;
  ctx.font = `500 ${pSize}pt "Verdana"`;
  const priceText = `${formattedPrice}`;
  const textWidth = ctx.measureText(priceText).width;
  ctx.fillText(priceText, 10, 98);

  // Draw the arrow icon next to the price
  const arrowSize = formattedPrice.length > priceLength ? 15 : 18; // Set arrow size
  const aPosition = formattedPrice.length > priceLength ? 82 : 80; // Adjust arrow position
  const arrowX = 10 + textWidth + 5; // X position to draw the arrow (right of the price text)
  ctx.drawImage(arrowImage, arrowX, aPosition, arrowSize, arrowSize); // Adjust positioning as needed

  // Set the fill color for percentage change
  ctx.fillStyle = state;
  ctx.font = 'normal 16pt "Verdana"';
  ctx.fillText(`(${percentage.toFixed(2)}%)`, 10, 128);

  return canvas.toDataURL();
}
