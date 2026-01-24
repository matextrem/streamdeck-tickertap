import * as cheerio from 'cheerio';
import { API_PROVIDERS, PROVIDER, QUOTE_REPLACEMENTS } from './constants';
import { parseURL } from './parser';
import {
  ApiProviders,
  Endpoint,
  QuoteTypes,
  Regions,
  Currency,
  SelectorConfig,
} from './settings';

export async function getApiUrl(
  service: QuoteTypes,
  region: Regions,
  ticker?: string,
  currency: Currency = Currency.USD,
): Promise<{
  uri: string;
  selectors: Record<string, SelectorConfig>;
  symbol: string;
}> {
  const baseProvider = PROVIDER[region];
  const { baseUrl: API_URL } = API_PROVIDERS[baseProvider];
  if (!ticker) {
    throw new Error('No ticker provided');
  }
  let endpoint =
    API_PROVIDERS[baseProvider].endpoints[
      service as keyof (typeof API_PROVIDERS)[typeof baseProvider]['endpoints']
    ];

  let fallbackProvider: ApiProviders = baseProvider as ApiProviders;
  let apiUrl: string = API_URL;

  if (endpoint.fallback) {
    fallbackProvider = endpoint.fallback;
    // Handle currency-specific base URLs for fallback providers
    if (
      fallbackProvider === ApiProviders.CoinMarketCap &&
      currency === Currency.EUR &&
      API_PROVIDERS[fallbackProvider].baseUrlEUR
    ) {
      apiUrl = API_PROVIDERS[fallbackProvider].baseUrlEUR!;
    } else {
      apiUrl = API_PROVIDERS[fallbackProvider].baseUrl;
    }
    endpoint =
      API_PROVIDERS[fallbackProvider].endpoints[
        service as keyof (typeof API_PROVIDERS)[typeof baseProvider]['endpoints']
      ];
  }

  const { value, route, symbol, provider } = getTickerReplaced(
    service,
    ticker,
    fallbackProvider,
  );

  // Handle currency-specific base URLs for direct providers
  let finalApiUrl = apiUrl;
  if (provider) {
    if (
      provider === ApiProviders.CoinMarketCap &&
      currency === Currency.EUR &&
      API_PROVIDERS[provider].baseUrlEUR
    ) {
      finalApiUrl = API_PROVIDERS[provider].baseUrlEUR;
    } else {
      finalApiUrl = API_PROVIDERS[provider].baseUrl;
    }
  }

  const uri = parseURL(
    finalApiUrl,
    route ? ({ route } as Endpoint) : endpoint,
    value.toLowerCase(),
  );

  return {
    uri,
    selectors: getSelectors(provider as ApiProviders, fallbackProvider),
    symbol: symbol || '',
  };
}

export async function fetchStockData(
  service: QuoteTypes,
  region: Regions,
  ticker?: string,
  showIcon = true,
  currency: Currency = Currency.USD,
) {
  const { uri, selectors, symbol } = await getApiUrl(
    service,
    region,
    ticker,
    currency,
  );

  // Add cache-busting timestamp to URL
  const cacheBustingUri = uri.includes('?')
    ? `${uri}&_t=${Date.now()}`
    : `${uri}?_t=${Date.now()}`;

  const response = await fetch(cacheBustingUri, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    },
  });

  if (!response.ok) {
    console.error(response);
    throw new Error('Failed to fetch data');
  }
  const body = await response.text();
  const $ = cheerio.load(body);
  const baseProvider = PROVIDER[region];
  const endpoint = API_PROVIDERS[baseProvider].endpoints[service];
  const iconUrl = API_PROVIDERS[baseProvider].endpoints[service].iconUrl;
  return await extractStockData(
    $,
    service,
    selectors,
    symbol,
    showIcon ? iconUrl : '',
    endpoint.useSiteLogo,
  );
}

export async function extractStockData(
  $: cheerio.CheerioAPI,
  service: QuoteTypes,
  selectors: Record<string, SelectorConfig>,
  customSymbol?: string,
  iconUrl?: string,
  useSiteLogo?: boolean,
) {
  const data = {} as Record<string, string>;

  for (let key in selectors) {
    const { selector, extractor, fallbackSelector, fallbackExtractor } =
      selectors[key] as SelectorConfig;
    if (!selector) continue;
    const selectedExtractor = $(selector).length
      ? extractor
      : fallbackExtractor;
    const selectedElement = $(selector).length
      ? $(selector)
      : $(fallbackSelector);

    if (selectedExtractor) {
      data[key] = selectedExtractor(selectedElement, $);
    }
  }

  const icon = await getIcon(
    customSymbol || data.ticker,
    iconUrl === '' ? '' : useSiteLogo ? data.logo : iconUrl || '',
    service,
    useSiteLogo || false,
  );

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
  provider: ApiProviders,
) => {
  const tickerUpper = ticker.toUpperCase();

  if (type) {
    const replacement =
      QUOTE_REPLACEMENTS[provider][
        type as keyof (typeof QUOTE_REPLACEMENTS)[typeof provider]
      ];

    if (replacement && replacement[tickerUpper]) {
      return replacement[tickerUpper];
    }
  }
  return { value: ticker, route: '', symbol: '', provider: '' as ApiProviders };
};

// Cache for icons to prevent rate limiting from GitHub
const iconCache: Record<string, string> = {};

const getIcon = async (
  symbol: string,
  iconUrl: string,
  service: QuoteTypes,
  useSiteLogo: boolean,
) => {
  if (!iconUrl) return '';
  const customSymbol =
    service === QuoteTypes.FOREX ? symbol.replace(/USD|\/+/g, '') : symbol;

  const url = useSiteLogo
    ? iconUrl
    : `${iconUrl}/${customSymbol.toUpperCase()}.png`;

  // Check cache first to avoid rate limiting
  if (iconCache[url]) {
    return iconCache[url];
  }

  const iconResponse = await fetch(url);

  let icon: string;
  if (!iconResponse.ok) {
    console.error(iconResponse);
    icon = '';
  } else {
    icon = `${iconResponse.url}?raw=true`;
    // Cache successful icon fetches
    iconCache[url] = icon;
  }
  return icon;
};

const getSelectors = (
  provider: ApiProviders,
  fallbackProvider: ApiProviders,
): Record<string, SelectorConfig> => {
  if (provider) {
    return API_PROVIDERS[provider].selectors; // Use provider specific selectors
  } else {
    return API_PROVIDERS[fallbackProvider].selectors; // Use fallback provider selectors
  }
};
