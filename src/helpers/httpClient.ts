import { API_URL } from './settings';

export default class HttpClient {
  static async get(url: string) {
    const response = await fetch(`${API_URL}${url}`);
    return response.json();
  }
}
