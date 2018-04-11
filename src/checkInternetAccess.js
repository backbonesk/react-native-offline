/* @flow */
import makeHttpRequest from './makeHttpRequest';
import type { Options } from './makeHttpRequest';

export default function checkInternetAccess({
  method = 'HEAD',
  timeout = 3000,
  url = 'https://google.com',
}: Options): Promise<boolean> {
  return new Promise((resolve: (value: boolean) => void) => {
    makeHttpRequest({
      method,
      timeout,
      url,
    })
      .then(() => {
        resolve(true);
      })
      .catch(() => {
        resolve(false);
      });
  });
}
