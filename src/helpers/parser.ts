import { Endpoint } from './settings';

export const parseURL = (apiUrl: string, endpoint: Endpoint, data: string) => {
  let uri = `${apiUrl}/${endpoint.route}`;

  if (endpoint.query) {
    uri = `${uri}?${endpoint.query}=${data}`;
  } else {
    uri = `${uri}/${data}`;
  }

  return uri;
};
