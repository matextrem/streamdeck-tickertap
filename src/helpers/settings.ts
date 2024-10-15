import * as cheerio from 'cheerio';

export enum QuoteTypes {
  STOCK = 'stock',
  ETF = 'etf',
  FOREX = 'forex',
  COMMODITY = 'commodity',
  FUTURE = 'future',
  FUNDS = 'funds',
  BONDS = 'bonds',
  CRYPTO = 'crypto',
}

export enum Regions {
  US = 'us',
  CA = 'ca',
  EU = 'eu',
  ASIA = 'asia',
}
export type Settings = {
  ticker: string;
  showAs: string;
  frequency: string;
  type: QuoteTypes;
  showIcon: boolean;
  region: Regions;
  showTotal: boolean;
  totalAmount: number;
  risingColor: string;
  fallingColor: string;
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
  iconUrl?: string;
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
