/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { Config } from '@app/services';

import { MockResponse } from './response.mock';

/**
 * Defining types
 */
export type RestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/**
 * Declaring the constants
 */

export class MockRequest {
  private readonly headers: Record<string, string> = {};
  private body: object | null = null;

  constructor(
    private readonly method: RestMethod,
    private readonly url: string,
  ) {}

  static get(url: string): MockRequest {
    return new MockRequest('GET', url);
  }

  static post(url: string): MockRequest {
    return new MockRequest('POST', url);
  }

  static put(url: string): MockRequest {
    return new MockRequest('PUT', url);
  }

  static delete(url: string): MockRequest {
    return new MockRequest('DELETE', url);
  }

  private async execute(): Promise<MockResponse> {
    const opts: FetchRequestInit = { headers: this.headers, method: this.method };
    if (this.body) opts.body = JSON.stringify(this.body);
    const port = process.env.PORT ?? 8080;
    const url = `http://localhost:${port}${this.url}`;
    const response = await fetch(url, opts);
    const body = await response.text();
    const cookies = response.headers.get('Set-Cookie');
    if (cookies?.startsWith(Config.get('cookie.name') + '=;')) {
      const cookie = this.headers['Cookie'];
      for (const [name, value] of MockResponse.cookies.entries()) {
        if (value === cookie) {
          MockResponse.cookies.delete(name);
          break;
        }
      }
    }

    return new MockResponse(response, body);
  }

  send(data: object): MockRequest {
    this.body = data;
    return this;
  }

  cookie(cookie: string): MockRequest {
    const cookieName = Config.get('cookie.name');
    const value = cookie.startsWith(cookieName) ? cookie : cookieName + '=' + cookie;
    this.header('Cookie', value);
    return this;
  }

  header(key: string, value: string): MockRequest {
    this.headers[key] = value;
    return this;
  }

  session(key: string): MockRequest {
    let cookie = MockResponse.cookies.get(key);
    if (!cookie) throw new Error(`Cookie '${key}' not present in cookie store`);
    this.cookie(cookie);
    return this;
  }

  then(resolve: (value: MockResponse) => MockResponse, reject: (reason: any) => void): Promise<MockResponse | void> {
    return this.execute().then(resolve, reject);
  }

  catch(reject: (reason: any) => void): Promise<MockResponse | void> {
    return this.execute().then(null, reject);
  }

  finally(callback: () => void): Promise<MockResponse> {
    return this.execute().finally(callback);
  }
}
