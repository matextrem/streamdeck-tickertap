export enum QuoteTypes {
  STOCK = 'stock',
  FOREX = 'forex',
  COMMODITY = 'commodity',
  FUTURE = 'future',
}
export type Settings = {
  ticker: string;
  frequency: string;
  type: QuoteTypes;
};

export const ON_PUSH = 'on-push';
// Github repository: https://github.com/matextrem/stonks-api
export const API_URL =
  'https://soic0q12c5.execute-api.us-east-1.amazonaws.com/dev';

export type GlobalSettings = {};

export type Frequency = 'on-push' | string;
