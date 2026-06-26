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

  // CoinMarketCap no longer server-renders the price into the DOM (the old
  // selectors return nothing -> NaN). Parse the server-rendered __NEXT_DATA__
  // JSON blob instead, which doesn't require JavaScript.
  let isCoinMarketCapHost = false;
  try {
    const hostname = new URL(uri).hostname.toLowerCase();
    isCoinMarketCapHost =
      hostname === 'coinmarketcap.com' ||
      hostname.endsWith('.coinmarketcap.com');
  } catch {
    isCoinMarketCapHost = false;
  }

  if (isCoinMarketCapHost) {
    return await extractCoinMarketCapData(body, showIcon, currency);
  }

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

/** Extract and parse the Next.js __NEXT_DATA__ JSON blob from an HTML page. */
function extractNextData(body: string): any | null {
  const match = body.match(
    /<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/,
  );
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

/**
 * Fetch the EUR/USD rate (USD per 1 EUR) using the existing forex pipeline,
 * so we can convert CoinMarketCap's USD-only JSON price to EUR.
 */
async function getEurUsdRate(): Promise<number> {
  try {
    const fx = await fetchStockData(
      QuoteTypes.FOREX,
      Regions.US,
      'EURUSD',
      false,
      Currency.USD,
    );
    return Number.isFinite(fx.price) && fx.price > 0 ? fx.price : 0;
  } catch {
    return 0;
  }
}

/**
 * Parse CoinMarketCap quote data from the page's __NEXT_DATA__ JSON.
 * The embedded `statistics.price` is always USD, so convert to EUR when needed.
 */
export async function extractCoinMarketCapData(
  body: string,
  showIcon = true,
  currency: Currency = Currency.USD,
) {
  const data = extractNextData(body);
  const detail = data?.props?.pageProps?.detailRes?.detail;

  if (!detail?.statistics || typeof detail.statistics.price === 'undefined') {
    throw new Error('Failed to parse CoinMarketCap data');
  }

  let price = Number(detail.statistics.price);
  const percentageChange = Number(detail.statistics.priceChangePercentage24h);

  // The JSON price is USD-only (even on /de); convert to EUR via forex.
  if (currency === Currency.EUR) {
    const rate = await getEurUsdRate();
    if (rate > 0) {
      price = price / rate;
    }
  }

  // Reconstruct the absolute change from the 24h percentage.
  const prevClose =
    percentageChange !== -100 ? price / (1 + percentageChange / 100) : price;
  const change = price - prevClose;

  const icon =
    showIcon && detail.id
      ? `https://s2.coinmarketcap.com/static/img/coins/64x64/${detail.id}.png`
      : '';

  return {
    name: detail.name as string,
    ticker: detail.symbol as string,
    icon,
    price,
    change,
    percentageChange,
  };
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
