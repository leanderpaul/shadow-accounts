/**
 * Importing npm packages
 */
import { type JSONData } from '@leanderpaul/shadow-service';

/**
 * Importing user defined packages
 */
import { Config, Logger } from '@app/services';

import { MockResponse } from './response.mock';

/**
 * Defining types
 */
export type RestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/**
 * Declaring the constants
 */
const logger = Logger.getLogger('MockRequest');

export class MockRequest {
  private readonly headers: Record<string, string> = {};
  private body: object | null = null;

  constructor(
    private readonly method: RestMethod,
    private readonly url: string,
  ) {
    this.header('Accept', '*/*');
    this.header('Accept-Language', 'en-GB,en;q=0.5');
    this.header('Accept-Encoding', 'gzip, deflate, br');
  }

  static get(url: string): MockRequest {
    return new MockRequest('GET', url);
  }

  static post(url: string, body?: Record<string, JSONData>): MockRequest {
    const request = new MockRequest('POST', url);
    if (body) request.send(body);
    return request;
  }

  static put(url: string, body?: Record<string, JSONData>): MockRequest {
    const request = new MockRequest('PUT', url);
    if (body) request.send(body);
    return request;
  }

  static delete(url: string): MockRequest {
    return new MockRequest('DELETE', url);
  }

  private async execute(): Promise<MockResponse> {
    const opts: FetchRequestInit = { headers: this.headers, method: this.method };
    if (this.body) opts.body = JSON.stringify(this.body);
    const port = process.env.PORT ?? 8081;
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
    logger.debug(`${this.method} ${this.url} => ${response.status}`, { body, cookies });
    return new MockResponse(response, body);
  }

  send(data: Record<string, JSONData>): MockRequest {
    this.header('Content-Type', 'application/json');
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
    const cookie = MockResponse.cookies.get(key);
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
