import * as cheerio from 'cheerio';
import { API_PROVIDERS, PROVIDER, QUOTE_REPLACEMENTS } from './constants';
import { parseURL } from './parser';
import { ApiProviders, Endpoint, QuoteTypes } from './settings';

const API_URL = API_PROVIDERS[PROVIDER].baseUrl;
const API_SELECTORS = API_PROVIDERS[PROVIDER].selectors;

export async function fetchStockData(service: QuoteTypes, ticker?: string) {
  if (!ticker) {
    throw new Error('No ticker provided');
  }
  let endpoint =
    API_PROVIDERS[PROVIDER].endpoints[
      service as keyof (typeof API_PROVIDERS)[typeof PROVIDER]['endpoints']
    ];

  let fallbackProvider: ApiProviders = PROVIDER as ApiProviders;
  let apiUrl: string = API_URL;

  if (endpoint.fallback) {
    fallbackProvider = endpoint.fallback;
    apiUrl = API_PROVIDERS[fallbackProvider].baseUrl;
    endpoint =
      API_PROVIDERS[fallbackProvider].endpoints[
        service as keyof (typeof API_PROVIDERS)[typeof PROVIDER]['endpoints']
      ];
  }

  const { value, route, symbol, provider } = getTickerReplaced(
    service,
    ticker,
    fallbackProvider
  );

  const uri = parseURL(
    provider ? API_PROVIDERS[provider].baseUrl : apiUrl,
    route ? ({ route } as Endpoint) : endpoint,
    value.toLowerCase()
  );

  const response = await fetch(uri);

  if (!response.ok) {
    console.error(response);
    throw new Error('Failed to fetch data');
  }
  const body = await response.text();
  const $ = cheerio.load(body);

  return await extractStockData($, provider || fallbackProvider, symbol);
}

export async function extractStockData(
  $: cheerio.CheerioAPI,
  fallbackProvider?: ApiProviders,
  customSymbol?: string
) {
  const data = {} as Record<string, string>;
  const selectors = !!fallbackProvider
    ? API_PROVIDERS[fallbackProvider].selectors
    : API_SELECTORS;

  for (let key in selectors) {
    const { selector, extractor, fallbackSelector, fallbackExtractor } =
      selectors[key] as any;
    const selectedExtractor = $(selector).length
      ? extractor
      : fallbackExtractor;
    const selectedElement = $(selector).length
      ? $(selector)
      : $(fallbackSelector);
    data[key] = selectedExtractor(selectedElement, $);
  }

  return {
    name: data.name,
    ticker: customSymbol || data.ticker,
    price: parseFloat(data.price as string),
    change: parseFloat(data.change as string),
    percentageChange: parseFloat(data.percentageChange as string),
  };
}

const getTickerReplaced = (
  type: QuoteTypes,
  ticker: string,
  provider: ApiProviders
) => {
  const tickerUpper = ticker.toUpperCase();

  if (type) {
    const replacement = QUOTE_REPLACEMENTS[provider][type];

    if (replacement && replacement[tickerUpper]) {
      return replacement[tickerUpper];
    }
  }
  return { value: ticker, route: '', symbol: '', provider: '' as ApiProviders };
};
