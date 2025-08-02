import { Endpoint } from './settings';

const DEFAULT_DECIMALS = 2;

export const parseURL = (apiUrl: string, endpoint: Endpoint, data: string) => {
  let uri = `${apiUrl}/${endpoint.route}`;

  if (endpoint.query) {
    uri = `${uri}?${endpoint.query}=${data}`;
  } else {
    uri = `${uri}/${data}`;
  }

  return uri;
};

export const formatPrice = (price: number, decimals = DEFAULT_DECIMALS) => {
  const priceStr = price.toString();
  const parts = priceStr.split('.');

  // If there is no decimal part, or custom decimals is specified
  if (decimals !== DEFAULT_DECIMALS || parts.length < 2) {
    const fixedPrice = price.toFixed(decimals);
    return decimals > 0 ? parseFloat(fixedPrice).toString() : fixedPrice;
  }

  const decimalPart = parts[1];
  // Find the first non-zero value in the decimal part
  const firstNonZeroIndex = decimalPart.search(/[1-9]/);

  // If all decimal digits are zero or there are no significant decimal digits, return formatted to default decimals
  if (firstNonZeroIndex === -1) {
    return price.toFixed(2);
  }

  // The total number of decimal places to show is the position of the first non-zero digit + default decimals
  const totalDecimals = firstNonZeroIndex + 2;
  const formattedPrice = price.toFixed(totalDecimals);

  return formattedPrice;
};

export const addThousandSeperator = (number: number) => {
  return number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
};

/**
 * Parse price string from different locale formats
 * Handles USD format (115,663.89) and EUR format (115.663,89)
 * @param priceStr - The price string to parse
 * @returns Parsed number
 */
export const parsePriceFromString = (priceStr: string): string => {
  if (!priceStr) return '0';

  // Remove currency symbols and extra whitespace
  let cleaned = priceStr
    .trim()
    .replace(/[€$£¥]/g, '')
    .trim();

  // Check if it's EUR format (comma as decimal separator)
  // In EUR format, the comma is the decimal separator and comes after the period
  if (
    cleaned.includes(',') &&
    cleaned.includes('.') &&
    cleaned.indexOf(',') > cleaned.indexOf('.')
  ) {
    // EUR format: 115.663,89 -> 115663.89
    // Remove dots (thousand separators) and replace comma with dot
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (cleaned.includes(',')) {
    // USD format: 115,663.89 -> 115663.89
    // Remove commas (thousand separators)
    cleaned = cleaned.replace(/,/g, '');
  }

  return cleaned;
};
