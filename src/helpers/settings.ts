import * as cheerio from 'cheerio';

export enum QuoteTypes {
  STOCK = 'stock',
  FOREX = 'forex',
  COMMODITY = 'commodity',
  FUTURE = 'future',
  CRYPTO = 'crypto',
}
export type Settings = {
  ticker: string;
  frequency: string;
  type: QuoteTypes;
};

export const ON_PUSH = 'on-push';

export type GlobalSettings = {};

export type Frequency = 'on-push' | string;

export enum ApiProviders {
  Finviz = 'finviz',
  Investing = 'investing.com',
  CoinMarketCap = 'coinmarketcap',
}

export interface Endpoint {
  route: string;
  query?: string;
  fallback?: ApiProviders;
}

interface SelectorConfig {
  selector: string;
  fallbackSelector?: string;
  extractor: (
    element: cheerio.Cheerio<cheerio.Element>,
    $: cheerio.CheerioAPI
  ) => string;
  fallbackExtractor?: (
    element: cheerio.Cheerio<cheerio.Element>,
    $: cheerio.CheerioAPI
  ) => string;
}

interface ProviderConfig {
  baseUrl: string;
  endpoints: {
    [key: string]: Endpoint;
  };
  selectors: {
    [key: string]: SelectorConfig;
  };
}

export interface ApiProvidersConfig {
  [key: string]: ProviderConfig;
}
