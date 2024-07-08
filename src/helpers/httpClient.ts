import { QuoteTypes } from './settings';
import { fetchStockData } from './utils';

export default class HttpClient {
  static async get(ticker: string, type = QuoteTypes.STOCK, showIcon = true) {
    const stockData = await fetchStockData(type, ticker, showIcon);
    return stockData;
  }
}
