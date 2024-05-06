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
export const API_URL = 'https://matextrem-stonks-api.vercel.app/api';

export type GlobalSettings = {};

export type Frequency = 'on-push' | string;
