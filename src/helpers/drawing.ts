import { createCanvas, loadImage, CanvasRenderingContext2D } from 'canvas';
import {
  arrowUp,
  arrowDown,
  ImgState,
  changeSvgState,
} from '../images/actions/images';

export async function drawQuoteImage(
  ticker: string,
  price: number,
  change: number,
  percentage: number
): Promise<string> {
  const canvasWidth = 144;
  const canvasHeight = 144;
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
  ctx.font = 'bold 22pt "Verdana"';
  ctx.fillText(ticker, 10, 43);

  // Draw the stock price
  ctx.font = '500 20pt "Verdana"';
  const textWidth = ctx.measureText(`$${price.toFixed(2)}`).width;
  ctx.fillText(`${price.toFixed(2)}`, 10, 98);

  // Draw the arrow icon next to the price
  const arrowSize = 18; // Set arrow size
  ctx.drawImage(arrowImage, textWidth, 80, arrowSize, arrowSize); // Adjust positioning as needed

  // Set the fill color for percentage change
  ctx.fillStyle = state;
  ctx.font = 'normal 16pt "Verdana"';
  ctx.fillText(`(${percentage.toFixed(2)}%)`, 10, 128);

  return canvas.toDataURL();
}
