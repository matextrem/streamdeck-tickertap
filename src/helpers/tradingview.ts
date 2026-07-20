import * as cheerio from 'cheerio';
import { QuoteTypes, Regions } from './settings';

/**
 * TradingView data source for non-US-stock / non-crypto instruments (stocks
 * outside the US, ETFs, forex, commodities, futures, funds, bonds), replacing
 * investing.com. Resolution and quotes use the REST scanner (no `Origin`
 * header, which the Stream Deck WebView can't set) with real price + change.
 * US mutual funds aren't in the scanner and TradingView only serves their
 * change over an origin-locked websocket, so they fall back to the NAV from
 * the instrument's TradingView page (price only; change shown as unavailable).
 */

const TV_ORIGIN = 'https://www.tradingview.com';
const SCANNER_URL = 'https://scanner.tradingview.com/global/scan';
const RESOLVE_CACHE_PREFIX = 'tickertap:tv:symbol:';
const JSON_HEADERS = { 'Content-Type': 'application/json' };

export interface TvSearchResult {
  symbol: string; // full EXCHANGE:SYMBOL
  shortSymbol: string; // SYMBOL only
  exchange: string;
  description: string;
  type: string;
  typespecs: string[];
}

export interface TvQuote {
  name: string;
  ticker: string;
  price: number;
  change: number;
  percentageChange: number;
}

/**
 * Legacy short codes mapped to TradingView symbols, scoped by type so a code
 * never hijacks a real ticker (e.g. "ES" as a stock is Eversource, but as a
 * future it's the S&P 500 e-mini). Backward-compatible with the old codes;
 * anything else is resolved by search.
 */
const SHORTCUTS: Partial<Record<QuoteTypes, Record<string, string>>> = {
  [QuoteTypes.COMMODITY]: {
    GC: 'COMEX:GC1!', SI: 'COMEX:SI1!', PL: 'NYMEX:PL1!', HG: 'COMEX:HG1!',
    PA: 'NYMEX:PA1!', CRUDEOIL: 'NYMEX:CL1!', BRENT: 'ICEEUR:BRN1!',
    NATURALGAS: 'NYMEX:NG1!', CC: 'ICEUS:CC1!', CT: 'ICEUS:CT1!',
    JO: 'ICEUS:OJ1!', KC: 'ICEUS:KC1!', SB: 'ICEUS:SB1!', ZC: 'CBOT:ZC1!',
    ZL: 'CBOT:ZL1!', ZM: 'CBOT:ZM1!', ZS: 'CBOT:ZS1!', ZW: 'CBOT:ZW1!',
    ZO: 'CBOT:ZO1!', ZR: 'CBOT:ZR1!',
  },
  [QuoteTypes.FUTURE]: {
    ES: 'CME_MINI:ES1!', NQ: 'CME_MINI:NQ1!', YM: 'CBOT_MINI:YM1!',
    ER2: 'CME_MINI:RTY1!', NKD: 'CME:NKD1!', VX: 'CBOE_FUTURES:VX1!',
  },
  [QuoteTypes.STOCK]: {
    SPX: 'SP:SPX', DJI: 'DJ:DJI', IXIC: 'NASDAQ:IXIC', RUT: 'TVC:RUT',
    FTSE: 'TVC:UKX', DAX: 'XETR:DAX', FCHI: 'EURONEXT:PX1', VIX: 'TVC:VIX',
  },
  [QuoteTypes.FOREX]: {
    EURUSD: 'FX:EURUSD', GBPUSD: 'FX:GBPUSD', USDJPY: 'FX:USDJPY',
    USDCAD: 'FX:USDCAD', USDCHF: 'FX:USDCHF', AUDUSD: 'FX:AUDUSD',
    NZDUSD: 'FX:NZDUSD', EURGBP: 'FX:EURGBP', EURJPY: 'FX:EURJPY',
    USDKRW: 'FX_IDC:USDKRW', KRWUSD: 'FX_IDC:KRWUSD', XAUUSD: 'OANDA:XAUUSD',
  },
};

/** Legacy short-code -> TradingView symbol for a given type, or null. */
export function shortcutFor(type: QuoteTypes, ticker: string): string | null {
  return SHORTCUTS[type]?.[ticker.trim().toUpperCase()] ?? null;
}

/** Preferred exchanges per region, used to disambiguate search matches. */
const REGION_EXCHANGES: Record<string, string[]> = {
  [Regions.US]: ['AMEX', 'NASDAQ', 'NYSE', 'CBOE', 'TVC', 'SP', 'DJ', 'FX', 'OANDA', 'COMEX', 'NYMEX', 'CME', 'CBOT', 'CME_MINI'],
  [Regions.EU]: ['XETR', 'FWB', 'GETTEX', 'LSE', 'EURONEXT', 'BME', 'SIX', 'MIL', 'BIT', 'TRADEGATE'],
  [Regions.ASIA]: ['TSE', 'HKEX', 'SSE', 'SZSE', 'SET', 'NSE', 'BSE', 'KRX', 'TADAWUL', 'SGX', 'ASX'],
  [Regions.CA]: ['TSX', 'TSXV', 'NEO', 'CSE'],
};

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return parseFloat(value.replace(/,/g, ''));
  return NaN;
};

/** Turn an investing-style slug into a search query: strip cid + dots, spaces out. */
const tickerToQuery = (ticker: string): string =>
  ticker
    .replace(/\?.*$/, '') // drop ?cid=... query
    .replace(/\./g, '') // U.S. -> US
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const cacheGet = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const cacheSet = (key: string, value: string): void => {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures — resolution just isn't cached.
  }
};

/** The short symbol (after the exchange prefix) for display. */
export const shortSymbol = (fullSymbol: string): string => {
  const idx = fullSymbol.indexOf(':');
  return idx >= 0 ? fullSymbol.slice(idx + 1) : fullSymbol;
};

/** Public TradingView chart URL for an EXCHANGE:SYMBOL (used by long-press). */
export const tradingViewUrl = (fullSymbol: string): string =>
  `${TV_ORIGIN}/symbols/${fullSymbol.replace(':', '-')}/`;

/** TradingView screener `type` values per instrument type (search filter). */
const SCANNER_TYPES: Partial<Record<QuoteTypes, string[]>> = {
  [QuoteTypes.STOCK]: ['stock', 'dr'],
  [QuoteTypes.ETF]: ['fund'],
  [QuoteTypes.FUNDS]: ['fund'],
  [QuoteTypes.FOREX]: ['forex'],
  [QuoteTypes.COMMODITY]: ['futures'],
  [QuoteTypes.FUTURE]: ['futures'],
  [QuoteTypes.BONDS]: ['bond'],
};

interface ScanRow {
  s: string;
  d: any[];
}

/**
 * Search symbols via the scanner endpoint. Unlike the symbol-search endpoint,
 * the scanner does NOT require an `Origin` header — which the Stream Deck
 * WebView (QtWebEngine) can't set, since `Origin` is a forbidden fetch header
 * — so this works from the plugin. Results are ranked best-first for the
 * given type/region and used both for resolution and the PI autocomplete.
 */
export async function searchSymbols(
  query: string,
  region: Regions = Regions.US,
  type?: QuoteTypes,
): Promise<TvSearchResult[]> {
  const body = {
    filter: [{ left: 'name,description', operation: 'match', right: query }],
    symbols: { query: { types: (type && SCANNER_TYPES[type]) || [] } },
    columns: ['name', 'description', 'type', 'typespecs'],
    sort: { sortBy: 'volume', sortOrder: 'desc' },
    range: [0, 50],
  };
  const response = await fetch(SCANNER_URL, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`TradingView search failed (HTTP ${response.status})`);
  }
  const json = (await response.json()) as { data?: ScanRow[] };
  const results: TvSearchResult[] = (json.data || []).map((row) => {
    const [name, description, rowType, typespecs] = row.d;
    return {
      symbol: row.s,
      shortSymbol: shortSymbol(row.s),
      exchange: row.s.split(':')[0] || '',
      description: description || name || shortSymbol(row.s),
      type: rowType || '',
      typespecs: (typespecs as string[]) || [],
    };
  });
  return rankResults(results, query.toUpperCase(), type, region);
}

/** Rank results best-first by region fit, type fit and exact-symbol match. */
function rankResults(
  results: TvSearchResult[],
  queryUpper: string,
  type: QuoteTypes | undefined,
  region: Regions,
): TvSearchResult[] {
  const pref = REGION_EXCHANGES[region] || [];
  const compactQuery = queryUpper.replace(/[^A-Z0-9]/g, '');
  return results
    .map((r, index) => {
      let score = 0;
      const idx = pref.indexOf(r.exchange.toUpperCase());
      if (idx >= 0) score += 20 - idx * 0.1; // prefer the home exchange

      // Preserve investing's ETF vs Funds distinction via typespecs.
      if (type === QuoteTypes.ETF) {
        if (r.typespecs.includes('etf')) score += 6;
        else if (r.typespecs.includes('mutual')) score -= 4;
      } else if (type === QuoteTypes.FUNDS) {
        if (r.typespecs.includes('mutual') || r.typespecs.includes('closedend'))
          score += 6;
        else if (r.typespecs.includes('etf')) score -= 4;
      }
      // Prefer continuous futures over dated/expiring contracts.
      if (
        (type === QuoteTypes.FUTURE || type === QuoteTypes.COMMODITY) &&
        r.typespecs.includes('continuous')
      ) {
        score += 5;
      }
      // For bonds, prefer the yield (matches investing.com's behavior) over
      // the bond price index.
      if (type === QuoteTypes.BONDS && r.typespecs.includes('yield')) {
        score += 6;
      }
      // Exact ticker match (helps when the user types a symbol, not a name).
      if (r.shortSymbol.toUpperCase().replace(/[^A-Z0-9]/g, '') === compactQuery)
        score += 8;
      // Push down crypto/defi noise that matches broad names.
      if (r.typespecs.includes('crypto') || r.typespecs.includes('defi'))
        score -= 15;

      return { r, score, index };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((x) => x.r);
}

/**
 * Resolve the user's ticker input to an EXCHANGE:SYMBOL.
 * - Already-qualified `EXCHANGE:SYMBOL` (e.g. picked via autocomplete): as-is.
 * - Legacy short code (GC, ES, EURUSD, ...): mapped for backward compatibility.
 * - Otherwise: resolved via scanner search and cached permanently.
 */
export async function resolveSymbol(
  ticker: string,
  type: QuoteTypes,
  region: Regions,
): Promise<string> {
  const trimmed = ticker.trim();
  if (trimmed.includes(':')) return trimmed.toUpperCase();

  const shortcut = shortcutFor(type, trimmed);
  if (shortcut) return shortcut;

  const cacheKey = `${RESOLVE_CACHE_PREFIX}${type}:${region}:${trimmed.toUpperCase()}`;
  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const results = await searchSymbols(tickerToQuery(trimmed), region, type);
  if (!results.length) {
    throw new Error(`No TradingView match for "${ticker}"`);
  }
  cacheSet(cacheKey, results[0].symbol);
  return results[0].symbol;
}

/** Quote one or more symbols via the REST scanner. Returns a symbol->quote map. */
async function scannerQuotes(
  symbols: string[],
): Promise<Record<string, TvQuote>> {
  const body = {
    symbols: { tickers: symbols },
    columns: ['close', 'change', 'change_abs', 'description'],
  };
  const response = await fetch(SCANNER_URL, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`TradingView scanner failed (HTTP ${response.status})`);
  }
  const json = (await response.json()) as {
    data?: Array<{ s: string; d: [number, number, number, string] }>;
  };
  const out: Record<string, TvQuote> = {};
  for (const row of json.data || []) {
    const [close, changePct, changeAbs, description] = row.d;
    out[row.s] = {
      name: description || shortSymbol(row.s),
      ticker: shortSymbol(row.s),
      price: toNumber(close),
      change: toNumber(changeAbs),
      percentageChange: toNumber(changePct),
    };
  }
  return out;
}

/**
 * Price fallback for symbols the scanner doesn't cover (US mutual funds):
 * read the NAV from the instrument's TradingView page (schema.org JSON-LD).
 * The intraday change isn't in the page, so it's reported as unavailable.
 */
async function symbolPageQuote(fullSymbol: string): Promise<TvQuote | null> {
  const response = await fetch(tradingViewUrl(fullSymbol));
  if (!response.ok) return null;
  const $ = cheerio.load(await response.text());

  let quote: TvQuote | null = null;
  $('script[type="application/ld+json"]').each((_i, el) => {
    if (quote) return;
    try {
      const data = JSON.parse($(el).contents().text());
      const price = toNumber(data?.offers?.price);
      if (Number.isFinite(price)) {
        quote = {
          name: data.name || shortSymbol(fullSymbol),
          ticker: shortSymbol(fullSymbol),
          price,
          change: NaN, // not available from the page
          percentageChange: NaN,
        };
      }
    } catch {
      // Skip malformed JSON-LD blocks.
    }
  });
  return quote;
}

/**
 * Resolve then quote one instrument: scanner first (real price + change),
 * falling back to the page NAV for scanner-uncovered symbols (mutual funds).
 */
export async function fetchTradingViewQuote(
  ticker: string,
  type: QuoteTypes,
  region: Regions,
): Promise<TvQuote & { symbol: string }> {
  const symbol = await resolveSymbol(ticker, type, region);

  const quotes = await scannerQuotes([symbol]);
  let quote: TvQuote | null = quotes[symbol] || null;
  if (!quote || !Number.isFinite(quote.price)) {
    quote = await symbolPageQuote(symbol);
  }
  if (!quote || !Number.isFinite(quote.price)) {
    throw new Error(`No TradingView quote for ${symbol}`);
  }

  return { ...quote, symbol };
}
