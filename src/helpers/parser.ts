import { Endpoint } from './settings';

const MAX_DECIMALS = 2;

export const parseURL = (apiUrl: string, endpoint: Endpoint, data: string) => {
  let uri = `${apiUrl}/${endpoint.route}`;

  if (endpoint.query) {
    uri = `${uri}?${endpoint.query}=${data}`;
  } else {
    uri = `${uri}/${data}`;
  }

  return uri;
};

export const formatPrice = (price: number) => {
  const priceStr = price.toString();
  const parts = priceStr.split('.');

  // If there is no decimal part, simply return the price formatted to 2 decimals
  if (parts.length < MAX_DECIMALS) {
    return price.toFixed(2);
  }

  const decimalPart = parts[1];
  // Find the first non-zero value in the decimal part
  const firstNonZeroIndex = decimalPart.search(/[1-9]/);

  // If all decimal digits are zero or there are no decimal digits, return formatted to MAX_DECIMALS
  if (firstNonZeroIndex === -1) {
    return price.toFixed(2);
  }

  // The total number of decimal places to show is the position of the first non-zero digit + MAX_DECIMALS
  const totalDecimals = firstNonZeroIndex + MAX_DECIMALS;

  const formattedPrice = price.toFixed(totalDecimals);

  return formattedPrice;
};
