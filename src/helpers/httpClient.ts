import { QuoteTypes, Regions, Currency } from './settings';
import { fetchStockData } from './utils';

export default class HttpClient {
  static async get(
    ticker: string,
    type = QuoteTypes.STOCK,
    region = Regions.US,
    showIcon = true,
    currency = Currency.USD
  ) {
    const stockData = await fetchStockData(
      type,
      region,
      ticker,
      showIcon,
      currency
    );
    return stockData;
  }
}
