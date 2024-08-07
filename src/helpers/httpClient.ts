import { QuoteTypes, Regions } from './settings';
import { fetchStockData } from './utils';

export default class HttpClient {
  static async get(
    ticker: string,
    type = QuoteTypes.STOCK,
    region = Regions.US,
    showIcon = true
  ) {
    const stockData = await fetchStockData(type, region, ticker, showIcon);
    return stockData;
  }
}
