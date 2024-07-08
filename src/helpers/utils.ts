import * as cheerio from 'cheerio';
import { API_PROVIDERS, PROVIDER, QUOTE_REPLACEMENTS } from './constants';
import { parseURL } from './parser';
import { ApiProviders, Endpoint, QuoteTypes } from './settings';

const API_URL = API_PROVIDERS[PROVIDER].baseUrl;
const API_SELECTORS = API_PROVIDERS[PROVIDER].selectors;

export async function fetchStockData(
  service: QuoteTypes,
  ticker?: string,
  showIcon = true
) {
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
  const iconUrl =
    endpoint.iconUrl || API_PROVIDERS[PROVIDER].endpoints[service].iconUrl;
  return await extractStockData(
    $,
    service,
    provider || fallbackProvider,
    symbol,
    showIcon ? iconUrl : ''
  );
}

export async function extractStockData(
  $: cheerio.CheerioAPI,
  service: QuoteTypes,
  fallbackProvider?: ApiProviders,
  customSymbol?: string,
  iconUrl?: string
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

  const icon = await getIcon(customSymbol || data.ticker, iconUrl, service);

  return {
    name: data.name,
    ticker: customSymbol || data.ticker,
    icon,
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

const getIcon = async (
  symbol: string,
  iconUrl: string,
  service: QuoteTypes
) => {
  if (!iconUrl) return '';
  const customSymbol =
    service === QuoteTypes.FOREX ? symbol.replace(/USD|\/+/g, '') : symbol;
  const iconResponse = await fetch(
    `${iconUrl}/${customSymbol.toUpperCase()}.png`
  );
  let icon: string;
  if (!iconResponse.ok) {
    console.error(iconResponse);
    icon = '';
  } else {
    icon = `${iconResponse.url}?raw=true`;
  }
  return icon;
};
