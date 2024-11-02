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
