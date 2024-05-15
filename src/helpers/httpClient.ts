import { QuoteTypes } from './settings';
import { fetchStockData } from './utils';

export default class HttpClient {
  static async get(ticker: string, type = QuoteTypes.STOCK) {
    const stockData = await fetchStockData(type, ticker);
    return stockData;
  }
}
